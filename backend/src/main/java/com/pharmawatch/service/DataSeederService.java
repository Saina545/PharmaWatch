package com.pharmawatch.service;

import com.pharmawatch.entity.Alert;
import com.pharmawatch.entity.Company;
import com.pharmawatch.entity.WatchlistDrug;
import com.pharmawatch.repository.AlertRepository;
import com.pharmawatch.repository.WatchlistDrugRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeederService {

    private final AlertRepository alertRepository;
    private final WatchlistDrugRepository watchlistDrugRepository;

    @Transactional
    public void seedDemoDataIfEmpty(Company company) {
        long drugCount = watchlistDrugRepository.countByCompanyAndActiveTrue(company);
        if (drugCount > 0) return;

        log.info("Seeding demo data for company: {}", company.getName());

        List<WatchlistDrug> drugs = List.of(
            WatchlistDrug.builder().drugName("Ibuprofen").genericName("ibuprofen").therapeuticArea("NSAIDs / Pain Management").company(company).active(true).papersScannedToday(42).totalAlerts(8).build(),
            WatchlistDrug.builder().drugName("Metformin").genericName("metformin hydrochloride").therapeuticArea("Antidiabetic").company(company).active(true).papersScannedToday(31).totalAlerts(3).build(),
            WatchlistDrug.builder().drugName("Atorvastatin").genericName("atorvastatin calcium").therapeuticArea("Cardiovascular / Statins").company(company).active(true).papersScannedToday(28).totalAlerts(5).build(),
            WatchlistDrug.builder().drugName("Amoxicillin").genericName("amoxicillin").therapeuticArea("Antibiotics").company(company).active(true).papersScannedToday(19).totalAlerts(2).build(),
            WatchlistDrug.builder().drugName("Lisinopril").genericName("lisinopril").therapeuticArea("Cardiovascular / ACE Inhibitors").company(company).active(true).papersScannedToday(22).totalAlerts(4).build()
        );
        watchlistDrugRepository.saveAll(drugs);

        LocalDateTime now = LocalDateTime.now();

        Alert a1 = Alert.builder()
            .drugName("Ibuprofen")
            .sideEffect("Nausea")
            .summary("Mentions of 'Nausea' linked to Ibuprofen spiked by 15% across 4 new studies. Two papers specifically highlight increased incidence in elderly patients over 65.")
            .paperCount(4)
            .spikePercentage(15.0)
            .severity(Alert.Severity.CRITICAL)
            .company(company)
            .read(false)
            .createdAt(now.minusHours(2))
            .papers(List.of(
                Alert.PaperEvidence.builder().pmid("38123456").title("Ibuprofen-associated nausea in geriatric populations: A prospective cohort study").authors("Johnson R, Patel S, Kim Y").journal("Journal of Clinical Pharmacology").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38123456/").abstractSnippet("In a cohort of 1,240 patients aged 65+, ibuprofen use was associated with a statistically significant increase in nausea (OR 2.4, 95% CI 1.8–3.2, p<0.001) compared to placebo.").build(),
                Alert.PaperEvidence.builder().pmid("38234567").title("NSAID-induced gastrointestinal events: systematic review 2024").authors("Williams C, Ahmed F").journal("Alimentary Pharmacology & Therapeutics").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38234567/").abstractSnippet("Meta-analysis of 18 RCTs (n=24,500) confirms nausea as a leading GI adverse event for ibuprofen, occurring in 12–18% of patients receiving standard therapeutic doses.").build(),
                Alert.PaperEvidence.builder().pmid("38345678").title("Comparative tolerability of NSAIDs in elderly outpatients").authors("Rodriguez M, Chen L, Park J").journal("Drugs & Aging").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38345678/").abstractSnippet("Among 3 NSAIDs studied, ibuprofen demonstrated the highest nausea incidence (17.2%) versus naproxen (11.4%) and celecoxib (6.8%) in a randomised trial of 890 elderly outpatients.").build(),
                Alert.PaperEvidence.builder().pmid("38456789").title("Predictors of GI intolerance in NSAID therapy").authors("Thompson G, Singh R").journal("European Journal of Pain").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38456789/").abstractSnippet("Female sex, age >60, and concomitant PPI non-use were the strongest independent predictors of ibuprofen-induced nausea in a retrospective analysis of 6,200 pharmacy records.").build()
            ))
            .build();

        Alert a2 = Alert.builder()
            .drugName("Atorvastatin")
            .sideEffect("Myopathy")
            .summary("New meta-analysis of 12 trials reports 8% increase in muscle-related adverse events. Risk appears dose-dependent and correlated with concurrent statin therapy.")
            .paperCount(12)
            .spikePercentage(8.0)
            .severity(Alert.Severity.HIGH)
            .company(company)
            .read(false)
            .createdAt(now.minusHours(5))
            .papers(List.of(
                Alert.PaperEvidence.builder().pmid("38567890").title("Statin-induced myopathy: updated meta-analysis of atorvastatin trials 2019–2024").authors("Lee K, Martinez A, Okafor N").journal("Journal of the American College of Cardiology").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38567890/").abstractSnippet("Pooled analysis of 12 RCTs (n=41,200 patients) found atorvastatin 40–80 mg/day associated with an 8.1% absolute increase in muscle-related adverse events versus placebo (NNH=12.3).").build(),
                Alert.PaperEvidence.builder().pmid("38678901").title("Dose-dependency of atorvastatin myotoxicity in clinical practice").authors("Nakamura H, Dubois P").journal("European Heart Journal").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38678901/").abstractSnippet("High-intensity statin therapy (atorvastatin ≥40 mg) significantly elevated creatine kinase levels (>10×ULN) in 2.3% of patients in an observational study of 15,000 cardiology outpatients.").build(),
                Alert.PaperEvidence.builder().pmid("38789012").title("CYP3A4 interactions amplifying atorvastatin myopathy risk").authors("Garcia E, Hoffman M, Sun Q").journal("Clinical Pharmacokinetics").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38789012/").abstractSnippet("Co-administration of atorvastatin with CYP3A4 inhibitors (clarithromycin, diltiazem) tripled the risk of myopathy in a pharmacovigilance database analysis of 88,000 patient-years.").build()
            ))
            .build();

        Alert a3 = Alert.builder()
            .drugName("Metformin")
            .sideEffect("GI Disturbance")
            .summary("3 new RCT publications report mild increase in gastrointestinal symptoms. Effect appears temporary and resolves within 2 weeks of therapy initiation.")
            .paperCount(3)
            .spikePercentage(4.2)
            .severity(Alert.Severity.MEDIUM)
            .company(company)
            .read(false)
            .createdAt(now.minusHours(8))
            .papers(List.of(
                Alert.PaperEvidence.builder().pmid("38890123").title("Metformin GI tolerability: extended-release vs immediate-release formulations").authors("Brown D, Osei K, Fernandez L").journal("Diabetes Care").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38890123/").abstractSnippet("In a head-to-head RCT (n=1,240), ER metformin produced significantly fewer GI adverse events (nausea 9% vs 18%, diarrhea 7% vs 16%) compared to IR formulation at equivalent doses.").build(),
                Alert.PaperEvidence.builder().pmid("38901234").title("Dose-titration strategies to mitigate metformin gastrointestinal side effects").authors("Al-Hassan M, Yip W").journal("Endocrine Practice").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38901234/").abstractSnippet("Slow up-titration (500 mg weekly increments) reduced GI discontinuation rate from 11.4% to 4.2% (p<0.001) in a pragmatic trial of 780 newly diagnosed T2DM patients.").build(),
                Alert.PaperEvidence.builder().pmid("38912345").title("Gut microbiome changes as mediators of metformin GI intolerance").authors("Zhao F, Gupta S, O'Brien C").journal("Cell Metabolism").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38912345/").abstractSnippet("Metformin-induced alterations in the gut microbiome (particularly Akkermansia muciniphila enrichment) are strongly correlated with early GI symptoms in a 16S rRNA cohort study of 420 patients.").build()
            ))
            .build();

        Alert a4 = Alert.builder()
            .drugName("Lisinopril")
            .sideEffect("Dry Cough")
            .summary("Systematic review confirms persistent dry cough in 10-15% of patients. New data suggests ACE inhibitor-related cough may be more prevalent in Asian populations.")
            .paperCount(7)
            .spikePercentage(6.1)
            .severity(Alert.Severity.HIGH)
            .company(company)
            .read(true)
            .createdAt(now.minusDays(1).minusHours(3))
            .papers(List.of(
                Alert.PaperEvidence.builder().pmid("38023456").title("ACE inhibitor-induced cough: global prevalence meta-analysis").authors("Tanaka Y, Pham V, Jensen H").journal("Hypertension").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38023456/").abstractSnippet("Pooled analysis of 47 studies (n=93,400) found ACE inhibitor cough prevalence of 10.9% overall, with significantly higher rates in East Asian (33.0%) vs Caucasian (5.7%) populations.").build(),
                Alert.PaperEvidence.builder().pmid("38034567").title("Bradykinin pathway polymorphisms and lisinopril cough susceptibility").authors("Kim SH, Wilson P, Adeyemi T").journal("Pharmacogenomics Journal").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/38034567/").abstractSnippet("GWAS of 12,000 lisinopril users identified three SNPs in the bradykinin B2 receptor gene (BDKRB2) strongly associated with drug-induced cough (OR 3.1–4.8, p<5×10−8).").build()
            ))
            .build();

        Alert a5 = Alert.builder()
            .drugName("Amoxicillin")
            .sideEffect("Allergic Reaction")
            .summary("2 new case reports document delayed hypersensitivity reactions. Researchers recommend improved patient screening protocols before prescription.")
            .paperCount(2)
            .spikePercentage(2.5)
            .severity(Alert.Severity.LOW)
            .company(company)
            .read(true)
            .createdAt(now.minusDays(1).minusHours(12))
            .papers(List.of(
                Alert.PaperEvidence.builder().pmid("37923456").title("Delayed hypersensitivity to amoxicillin: two case reports and literature review").authors("Morris A, Chakrabarti P").journal("Journal of Allergy and Clinical Immunology: In Practice").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/37923456/").abstractSnippet("We report two cases of delayed maculopapular exanthema presenting 7–10 days after amoxicillin initiation, confirmed by lymphocyte transformation test. Both resolved completely upon discontinuation.").build(),
                Alert.PaperEvidence.builder().pmid("37934567").title("Predictive screening for beta-lactam allergies in primary care").authors("Santos R, Flynn M, Okonkwo E").journal("Primary Care Respiratory Medicine").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/37934567/").abstractSnippet("Implementation of a structured pre-prescription penicillin allergy assessment questionnaire reduced unnecessary allergy labels by 68% while identifying 3 true amoxicillin sensitised patients per 1,000 screened.").build()
            ))
            .build();

        Alert a6 = Alert.builder()
            .drugName("Ibuprofen")
            .sideEffect("Cardiovascular Risk")
            .summary("Long-term observational study across 50,000 patients shows 12% elevated cardiovascular event risk with chronic NSAID use exceeding 6 months.")
            .paperCount(1)
            .spikePercentage(12.0)
            .severity(Alert.Severity.CRITICAL)
            .company(company)
            .read(false)
            .createdAt(now.minusDays(2))
            .papers(List.of(
                Alert.PaperEvidence.builder().pmid("37845678").title("Chronic ibuprofen use and major adverse cardiovascular events: a 10-year cohort study").authors("Andersen L, Beaumont G, Hernandez R, Chen W").journal("The Lancet").pubYear(2024).pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/37845678/").abstractSnippet("In 50,279 patients followed for a median 8.4 years, chronic ibuprofen use (>6 months continuous) was associated with a 12% increased risk of MACE (HR 1.12, 95% CI 1.06–1.19) after adjustment for 32 confounders including comorbidities and concomitant medication.").build()
            ))
            .build();

        alertRepository.saveAll(List.of(a1, a2, a3, a4, a5, a6));

        log.info("Demo data seeded successfully for company: {}", company.getName());
    }
}