## Executive Summary

Small and medium-sized businesses (SMBs) and e-commerce merchants frequently suffer from sudden liquidity crises despite being profitable on paper. Unpredictable cash inflows, unexpected category expense spikes, overdue receivables (AR), and duplicate billing charges can deplete cash reserves faster than traditional accounting software alerts business owners.

**AI Cash-Flow Copilot** solves this by providing:
1. **Deterministic ML Cash-Flow Forecasting**: Holt-Winters time-series modeling with 7-day cyclical seasonality and variance confidence bounds (7d, 14d, 30d).
2. **Multi-Vector Anomaly Detection**: Statistical Z-score outlier detection, expense spikes vs category historical baselines, and duplicate subscription transaction flags.
3. **Explainable Risk & Solvency Index (0–100)**: Quantitative scoring of 6 health factors (Cash Runway, Revenue Momentum, Expense Ratios, Overdue AR Ratio, 7-Day Obligation Coverage, and Volatility).
4. **Tool-Grounded AI Agent**: A function-calling AI Copilot that directly queries database tables and ML pipelines—ensuring natural language answers are 100% grounded in facts with zero financial hallucinations.

---

##  System Architecture

```
                                  +---------------------------------------+
                                  |         React + Vite Frontend         |
                                  | (TypeScript / Tailwind CSS / Recharts)|
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTP / REST API
                                                      v
                                  +---------------------------------------+
                                  |         FastAPI Backend Application   |
                                  +---------+-----------------+-----------+
                                            |                 |
                  +-------------------------+                 +--------------------------+
                  |                                                                      |
                  v                                                                      v
   +------------------------------+                                       +------------------------------+
   |   Machine Learning Engine    |                                       |   Tool-Grounded AI Agent     |
   |                              |                                       |                              |
   | - Time-Series Forecasting    |                                       | - Tool Router & Function Call|
   |   (Trend + Seasonality + CI) |                                       | - Real SQL Query Execution   |
   | - Multi-Vector Anomalies     |                                       | - Deterministic Natural      |
   |   (Z-Score, Spikes, Dups)    |                                       |   Language Synthesis         |
   | - 6-Factor Risk Score Model  |                                       | - Audit Tool Log Drawer      |
   +--------------+---------------+                                       +--------------+---------------+
                  |                                                                      |
                  +-------------------------+--------------------------------------------+
                                            |
                                            v
                                 +-------------------------+
                                 |  SQLAlchemy Database    |
                                 |  (SQLite / PostgreSQL)  |
                                 +-------------------------+
```

---

## 🚀 Key Technical Features

### 1. ML Cash-Flow Forecasting Engine
- Calculates daily historical net cash velocity.
- Applies trend line decomposition with 7-day cyclic day-of-week seasonality factors.
- Generates 7-day, 14-day, and 30-day projected cash balances.
- Calculates dynamic confidence intervals (\(\pm \text{Uncertainty} = \sigma \cdot \sqrt{t}\)).
- Automatically flags predicted cash shortfalls and shortfall dates.

### 2. Multi-Vector Anomaly Detection
- **Statistical Z-Score Outliers**: Flags transactions > 3.0 standard deviations from category mean.
- **Category Expense Spikes**: Flags debits exceeding 2.5x historical category baseline.
- **Duplicate Payment Detector**: Identifies duplicate debit charges to the same vendor within 3 days.
- **Financial Exposure Calculator**: Quantifies potential dollar savings from resolving flagged items.

### 3. Transparent Solvency & Risk Score (0–100 Scale)
| Component Factor | Weight | Scoring Logic |
|---|---|---|
| **Cash Runway** | 25% | >60 days (100pts), 30-60 days (75pts), 14-30 days (45pts), <14 days (20pts) |
| **Revenue Growth Momentum** | 20% | Recent 30d vs Prior 30d revenue delta % |
| **Expense Growth Ratio** | 20% | Checks if expense growth outpaces revenue growth |
| **Overdue Receivables Ratio** | 15% | Overdue customer invoices vs current cash balance |
| **7-Day Shortfall Risk** | 10% | 7-day ML projection shortfall binary penalty |
| **Cash Flow Volatility** | 10% | Daily net flow coefficient of variation |

### 4. Tool-Grounded AI Copilot Architecture
- **8 Function-Calling Tools**:
  - `get_cash_balance`: Retrieves real-time balance & net burn.
  - `get_revenue`: Returns inflow totals & average transaction values.
  - `get_expenses`: Returns category spending breakdown.
  - `get_forecast`: Runs ML time-series forecast.
  - `get_anomalies`: Returns active anomaly records & dollar impact.
  - `get_overdue_receivables`: Lists overdue customer invoices & aging.
  - `get_top_expenses`: Analyzes top vendor spending.
  - `calculate_risk_score`: Evaluates the 6 health factors.
- **Tool Audit Log Drawer**: Full transparency drawer allowing judges to inspect raw JSON input parameters and returned SQL/ML facts.

---

## 🎬 5-Minute Judge Demo Workflow ("UrbanKart")

The application includes a **1-Click "Seed UrbanKart Demo"** action that seeds 6 months of realistic transaction data showcasing 5 intentional problem scenarios:

1. **Executive Dashboard Overview**:
   - Observe current cash balance (**₹2,50,000** baseline) and Risk Score (**72/100 Moderate Risk**).
   - Notice the active **Shortfall Warning Banner** alerting to a projected cash crunch in ~12 days.
2. **Cash Forecast View**:
   - Navigate to **Cash Flow Forecast** tab.
   - Inspect the Recharts time-series chart with upper/lower confidence bands and switch between **7, 14, and 30-day** horizons.
3. **Anomaly Audit**:
   - Navigate to **Anomaly Detector** tab.
   - Observe the detected **Duplicate SaaS Payment** to *CloudAnalytics Pro* (**₹14,500**) and **Ad Spend Surge** (**₹87,500/mo** vs ₹35,000 baseline).
   - Click **Mark Reviewed** to audit the entry.
4. **Risk Center & Actions**:
   - Navigate to **Risk Center** tab.
   - Review the 6-factor score meters and click **Execute Action** on *"Recover Overdue Payment from Acme Retail Stores (₹85,000)"*.
5. **AI Copilot Resolution**:
   - Open **AI Copilot Chat** tab.
   - Click the prompt chip: *"How can I avoid the projected cash shortage?"*.
   - Inspect how the agent calls `get_forecast`, `get_overdue_receivables`, `get_top_expenses`, and `get_anomalies` to deliver a grounded 3-step action plan.
   - Open the **Tool Execution Audit Log** drawer to view raw tool invocation payloads.

---

## 💻 Installation & Local Setup Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup (FastAPI + SQLAlchemy)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
uvicorn app.main:app --reload --port 8000
```
*API Swagger Documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 2. Frontend Setup (React + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite dev server (Port 5173)
npm run dev
```
*Application interface will be open at [http://127.0.0.1:5173](http://127.0.0.1:5173)*

#### Windows quick start
Open two terminals from the project root. Run the backend in the first terminal:
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Run the frontend in the second terminal:
```powershell
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Use **Load sample data** in the top bar to populate the workspace with example transactions. The frontend needs the backend running on port `8000` for the dashboard, forecast, transactions, and cash assistant to work.

If PowerShell says that `node` is not recognized after installing Node.js, close and reopen VS Code so the new PATH is loaded. Confirm the installation with `node --version` and `npm --version`.

### 3. Automated Test Verification
```bash
cd backend
pytest -v
```

---

## 📄 API Documentation

- `GET /api/dashboard/summary/1`: Get executive metrics summary & risk score.
- `GET /api/forecast/1?horizon_days=30`: Retrieve time-series forecast data.
- `GET /api/anomalies/1`: Trigger scan & retrieve active anomalies.
- `POST /api/anomalies/{id}/resolve`: Resolve anomaly flag.
- `GET /api/risk-score/1`: Calculate 6-factor solvency breakdown.
- `GET /api/recommendations/1`: List actionable recommendations.
- `POST /api/recommendations/{id}/apply`: Apply recommendation action.
- `GET /api/transactions/1`: Search & filter transaction ledger.
- `POST /api/transactions/1/upload-csv`: Upload bank CSV export.
- `POST /api/copilot/chat`: Process tool-grounded AI agent queries.
- `POST /api/demo/seed`: Reset & seed 6-month UrbanKart demo dataset.

---
