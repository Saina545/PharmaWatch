"""
PharmaWatch - Nightly AI Paper Scanner
Searches PubMed for new papers, extracts side effects using BioBERT,
then upserts alerts into the PostgreSQL database.
"""

import os
import sys
import json
import logging
import requests
import psycopg2
from datetime import datetime, timedelta
from transformers import pipeline

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL")
HF_API_KEY   = os.environ.get("HF_API_KEY", "")
PUBMED_KEY   = os.environ.get("PUBMED_API_KEY", "")

PUBMED_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

SEVERITY_RULES = {
    "cardiovascular": "CRITICAL",
    "cardiac":        "CRITICAL",
    "hepatotoxicity": "CRITICAL",
    "liver failure":  "CRITICAL",
    "anaphylaxis":    "CRITICAL",
    "stroke":         "CRITICAL",
    "myopathy":       "HIGH",
    "renal":          "HIGH",
    "nephrotoxicity": "HIGH",
    "nausea":         "MEDIUM",
    "vomiting":       "MEDIUM",
    "diarrhea":       "MEDIUM",
    "cough":          "LOW",
    "headache":       "LOW",
    "rash":           "LOW",
}


def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


def get_watchlist(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT w.drug_name, w.company_id
            FROM watchlist w
            WHERE w.is_active = TRUE
        """)
        return cur.fetchall()


def search_pubmed(drug_name: str, days_back: int = 1) -> list:
    since = (datetime.now() - timedelta(days=days_back)).strftime("%Y/%m/%d")
    params = {
        "db": "pubmed", "term": f"{drug_name}[Title/Abstract] AND adverse[Title/Abstract]",
        "reldate": days_back, "datetype": "pdat",
        "retmax": 20, "retmode": "json", "api_key": PUBMED_KEY,
    }
    try:
        r = requests.get(PUBMED_SEARCH, params=params, timeout=15)
        r.raise_for_status()
        ids = r.json().get("esearchresult", {}).get("idlist", [])
        log.info(f"  PubMed returned {len(ids)} IDs for '{drug_name}'")
        return ids
    except Exception as e:
        log.warning(f"  PubMed search failed: {e}")
        return []


def fetch_abstracts(pmids: list) -> list:
    if not pmids:
        return []
    params = {
        "db": "pubmed", "id": ",".join(pmids),
        "rettype": "abstract", "retmode": "xml", "api_key": PUBMED_KEY,
    }
    try:
        r = requests.get(PUBMED_FETCH, params=params, timeout=20)
        r.raise_for_status()
        # Simple text extraction - in production use lxml
        text = r.text
        abstracts = []
        import re
        for m in re.finditer(r'<AbstractText[^>]*>(.*?)</AbstractText>', text, re.DOTALL):
            abstracts.append(m.group(1).strip())
        return abstracts
    except Exception as e:
        log.warning(f"  Fetch abstracts failed: {e}")
        return []


def extract_side_effects_hf(text: str, drug_name: str) -> list:
    """Use Hugging Face Inference API (BioBERT NER) to extract medical entities."""
    API_URL = "https://api-inference.huggingface.co/models/allenai/scibert_scivocab_uncased"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    try:
        r = requests.post(API_URL, headers=headers, json={"inputs": text[:512]}, timeout=30)
        if r.status_code == 200:
            entities = r.json()
            side_effects = []
            for e in (entities if isinstance(entities, list) else []):
                word = e.get("word", "").lower()
                if any(k in word for k in SEVERITY_RULES.keys()):
                    side_effects.append(word)
            return list(set(side_effects))
    except Exception as e:
        log.warning(f"  HF API call failed: {e}")

    # Fallback: simple keyword extraction
    found = []
    text_lower = text.lower()
    for keyword in SEVERITY_RULES.keys():
        if keyword in text_lower:
            found.append(keyword)
    return found


def classify_severity(side_effect: str) -> str:
    for keyword, severity in SEVERITY_RULES.items():
        if keyword in side_effect.lower():
            return severity
    return "LOW"


def upsert_alert(conn, company_id: int, drug_name: str, side_effect: str,
                 paper_count: int, spike_pct: float, severity: str, summary: str):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO alerts
              (drug_name, side_effect, summary, paper_count, spike_percentage,
               severity, company_id, is_read, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, FALSE, NOW())
        """, (drug_name, side_effect.title(), summary, paper_count, spike_pct, severity, company_id))

        cur.execute("""
            UPDATE watchlist
            SET papers_scanned_today = papers_scanned_today + %s,
                total_alerts = total_alerts + 1
            WHERE drug_name = %s AND company_id = %s AND is_active = TRUE
        """, (paper_count, drug_name, company_id))

    conn.commit()
    log.info(f"  → Alert saved: [{severity}] {drug_name} / {side_effect} ({paper_count} papers)")


def reset_daily_counts(conn):
    with conn.cursor() as cur:
        cur.execute("UPDATE watchlist SET papers_scanned_today = 0")
    conn.commit()
    log.info("Daily paper counts reset.")


def main():
    log.info("=== PharmaWatch Nightly Scan Starting ===")

    if not DATABASE_URL:
        log.error("DATABASE_URL not set. Exiting.")
        sys.exit(1)

    conn = get_db_connection()
    try:
        reset_daily_counts(conn)
        drugs = get_watchlist(conn)
        log.info(f"Found {len(drugs)} drug-company pairs to scan.")

        for drug_name, company_id in drugs:
            log.info(f"\nScanning: {drug_name} (company_id={company_id})")
            pmids = search_pubmed(drug_name, days_back=1)
            if not pmids:
                log.info("  No new papers found.")
                continue

            abstracts = fetch_abstracts(pmids)
            all_effects = []
            for abstract in abstracts:
                effects = extract_side_effects_hf(abstract, drug_name)
                all_effects.extend(effects)

            # Aggregate
            from collections import Counter
            effect_counts = Counter(all_effects)
            for effect, count in effect_counts.most_common(3):
                if count < 1:
                    continue
                severity = classify_severity(effect)
                spike = round((count / max(len(pmids), 1)) * 100, 1)
                summary = (
                    f"Automated scan detected {count} mention(s) of '{effect.title()}' linked to "
                    f"{drug_name} across {len(pmids)} new publication(s) in the last 24 hours. "
                    f"Signal spike: +{spike}%. Review recommended."
                )
                upsert_alert(conn, company_id, drug_name, effect,
                             len(pmids), spike, severity, summary)

        log.info("\n=== Nightly Scan Complete ===")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
