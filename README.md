# PharmaWatch – AI-Powered Pharmacovigilance & Biomedical Intelligence Platform

## Overview

PharmaWatch is a B2B pharmacovigilance and biomedical intelligence platform designed for pharmaceutical companies, biomedical researchers, and drug safety teams to continuously monitor emerging research and drug-safety signals.

Every day, thousands of biomedical and clinical research papers are published across journals and repositories. Manually reviewing this volume of literature is time-consuming, expensive, and often results in important findings being overlooked.

PharmaWatch automates the process of collecting, analyzing, and synthesizing biomedical research. Using Natural Language Processing (NLP) and BioBERT-based Named Entity Recognition (NER), the system identifies adverse-event signals from biomedical literature and generates actionable insights through an interactive dashboard.

Instead of manually reviewing hundreds of research papers, organizations can maintain customized drug watchlists and receive prioritized alerts backed by scientific evidence, helping them identify emerging safety concerns and make evidence-based decisions faster.

---

# Problem Statement

Pharmaceutical companies, biomedical researchers, and pharmacovigilance teams face a significant challenge in monitoring newly published biomedical literature.

Thousands of research papers are published every week, making it nearly impossible to manually review every publication. As a result:

* Critical adverse drug reactions may go unnoticed.
* Newly discovered side effects can remain buried within unstructured text.
* Pharmacovigilance teams spend excessive time reviewing literature manually.
* Regulatory and compliance risks increase.
* Valuable scientific evidence remains underutilized.

An automated system is required to continuously monitor biomedical publications, extract relevant drug-safety information, and provide timely, evidence-based insights.

---

# Motivation

The motivation behind PharmaWatch is to help pharmaceutical organizations transform overwhelming volumes of biomedical research into actionable intelligence.

By leveraging Artificial Intelligence and Biomedical NLP, organizations can:

* Monitor drug safety trends automatically.
* Detect emerging adverse effects earlier.
* Reduce manual literature review efforts.
* Improve pharmacovigilance workflows.
* Support faster, data-driven decision making.

The project demonstrates how AI-powered biomedical information extraction and automated alert generation can improve the efficiency of modern drug-safety monitoring operations.

---

# Key Features

### Secure Authentication

* Corporate user login and registration.
* JWT-based authentication and authorization.
* Company-specific data isolation.

### Smart Dashboard

* Displays key monitoring metrics.
* Shows tracked drug statistics.
* Highlights newly analyzed papers.
* Displays critical safety alerts.

### Automated Alert Feed

* Prioritized list of significant findings.
* Detection of unusual side-effect trends.
* Automated alert generation from biomedical literature.

### Deep-Dive Analysis Panel

* Detailed investigation view for each alert.
* Historical side-effect trend visualization.
* Evidence-backed research summaries.
* Direct access to original PubMed publications.

### Portfolio Watchlist Management

* Add new drugs to monitor.
* Remove existing drugs.
* Manage company-specific tracking portfolios.

### Global Search System

* Search across biomedical intelligence records.
* Query by drug name.

### AI-Powered Information Extraction

* Biomedical text processing using BioBERT.
* Named Entity Recognition (NER).
* Adverse-event and disease entity extraction.
* Automated biomedical signal aggregation.
* Alert synthesis from biomedical literature.

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Spring Boot Backend │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼───────────────┐
               │                               │
               ▼                               ▼
    ┌───────────────────┐          ┌───────────────────┐
    │   PostgreSQL DB   │          │  Python AI Engine │
    └───────────────────┘          └─────────┬─────────┘
                                              │
                                              ▼
                               ┌─────────────────────────┐
                               │   BioBERT NER Engine    │
                               └─────────┬──────────────┘
                                         │
                                         ▼
                               ┌─────────────────────────┐
                               │ PubMed Biomedical Data  │
                               └─────────────────────────┘
```

---

# Methodology

### Step 1: Drug Watchlist Creation

Users create and manage a watchlist containing drugs they wish to monitor.

### Step 2: Biomedical Literature Collection

The system continuously gathers relevant PubMed publications associated with tracked drugs.

### Step 3: Text Processing

Research abstracts are extracted and prepared for NLP analysis.

### Step 4: Information Extraction

BioBERT-based NER identifies:

* Disease entities
* Adverse reactions
* Side-effect signals
* Biomedical concepts from research abstracts

### Step 5: Signal Aggregation

Extracted entities are aggregated and mapped to severity categories.

### Step 6: Alert Generation

The system detects significant safety signals and generates evidence-backed alerts.

### Step 7: Visualization

Insights are presented through dashboards, charts, alert feeds, and detailed investigation panels.

---

# Technology Stack

## Frontend

* React.js
* React Router
* Axios
* CSS3

## Backend

* Java Spring Boot
* Spring Security
* Spring Data JPA
* REST APIs
* JWT Authentication

## Database

* PostgreSQL

## AI & NLP

* Python
* BioBERT
* Hugging Face Inference API
* Named Entity Recognition (NER)
* PubMed API
* Requests
* psycopg2

## DevOps & Infrastructure

* Docker
* Docker Compose
* GitHub Actions
* Git

---

# Project Structure

```text
PHARMAWATCH/
│
├── frontend/
├── backend/
├── ai-engine/
├── docker-compose.yml
├── .github/workflows/
└── README.md
```

---

# Screenshots

## Login Page

![Login Page](screenshots/login.png)

---

## Registration Page

![Registration Page](screenshots/registration.png)

---

## Main Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Alert Details (Deep Dive Panel)

![Deep Dive Panel](screenshots/deepdive.png)

---

## Watchlist Manager

![Watchlist Manager](screenshots/watchlist.png)

---

## Global Search

![Global Search](screenshots/globalsearch.png)

---

# Running the Application

## Clone Repository

```bash
git clone https://github.com/your-username/pharmawatch.git
cd pharmawatch
```

## Start Complete Application Stack

```bash
docker compose up --build
```

Docker Compose automatically:

* Builds the Spring Boot backend image.
* Builds the React frontend image.
* Creates the PostgreSQL database container.
* Configures networking between services.
* Starts the complete PharmaWatch stack.

## Access Application

```text
Frontend  : http://localhost
Backend   : http://localhost:8080
Database  : localhost:5433
```



# Author

**Saina Hamid**
