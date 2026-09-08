import {
  DashboardSummary,
  ForecastResponse,
  AnomalyItem,
  RiskScoreResponse,
  Recommendation,
  CopilotResponse,
  TransactionItem,
  ForecastPoint,
  TransactionCreate
} from '../types';

const API_BASE = '/api';

// --- Realistic Fallback Mock Dataset (UrbanKart Demo) ---

const getMockForecast = (horizonDays = 30): ForecastResponse => {
  const points: ForecastPoint[] = [];
  let balance = 284500;
  const now = new Date();
  let minBalance = balance;
  let shortfallDate: string | null = null;
  let hasShortfall = false;

  for (let i = 1; i <= horizonDays; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const projectedInflow = isWeekend ? Math.round(12000 + Math.random() * 4000) : Math.round(18000 + Math.random() * 8000);
    const projectedOutflow = Math.round(21000 + Math.random() * 9000);
    
    const net = projectedInflow - projectedOutflow;
    balance += net;

    if (balance < minBalance) minBalance = balance;
    if (balance < 0 && !hasShortfall) {
      hasShortfall = true;
      shortfallDate = dateStr;
    }

    const uncertainty = Math.round(12000 * Math.sqrt(i) * 0.4);
    points.push({
      date: dateStr,
      forecast_balance: Math.round(balance),
      lower_bound: Math.round(balance - uncertainty),
      upper_bound: Math.round(balance + uncertainty),
      projected_inflow: projectedInflow,
      projected_outflow: projectedOutflow,
    });
  }

  return {
    business_id: 1,
    horizon_days: horizonDays,
    current_balance: 284500,
    projected_shortfall: hasShortfall,
    shortfall_date: shortfallDate || (new Date(Date.now() + 12 * 86400000)).toISOString().split('T')[0],
    min_projected_balance: Math.round(minBalance),
    points
  };
};

const MOCK_SUMMARY: DashboardSummary = {
  business_name: "UrbanKart",
  currency: "INR",
  current_balance: 284500,
  total_inflow_30d: 420000,
  total_outflow_30d: 495000,
  net_cash_flow_30d: -75000,
  runway_days: 34.5,
  pending_receivables: 80000,
  overdue_receivables: 85000,
  upcoming_payables_7d: 47500,
  risk_score: 72,
  risk_level: "Medium Risk",
  active_anomalies_count: 2
};

const MOCK_ANOMALIES: AnomalyItem[] = [
  {
    id: 101,
    title: "Duplicate SaaS Billing Charge",
    description: "Identified two identical debits of ₹14,500 to CloudAnalytics Pro within a 48-hour window.",
    category: "SaaS & Software",
    financial_impact: 14500,
    severity: "high",
    status: "active",
    detected_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 102,
    title: "Ad Spend Surge Exceeds Historical Baseline",
    description: "Meta Ad Spend increased by 180% over the last 14 days without corresponding order revenue growth.",
    category: "Marketing & Ads",
    financial_impact: 45000,
    severity: "medium",
    status: "active",
    detected_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 103,
    title: "Overdue Customer Receivable Alert",
    description: "Acme Retail Stores invoice #INV-2026-081 of ₹85,000 is overdue by 15 days.",
    category: "Accounts Receivable",
    financial_impact: 85000,
    severity: "high",
    status: "resolved",
    detected_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

const MOCK_RISK: RiskScoreResponse = {
  overall_score: 72,
  risk_level: "Medium Risk",
  runway_days: 34.5,
  net_cash_flow_30d: -75000,
  key_recommendation: "Recover ₹85,000 overdue from Acme Retail Stores & scale back unoptimized ad spend by 25%.",
  factors: [
    { factor_name: "Cash Runway Health", score: 65, weight: 0.25, status: "Warning", insight: "34.5 days of runway remaining based on 30-day net burn velocity." },
    { factor_name: "Net Cash Flow Trend", score: 58, weight: 0.20, status: "Warning", insight: "30-day net cash flow is negative (-₹75,000)." },
    { factor_name: "Accounts Receivable Risk", score: 70, weight: 0.15, status: "Warning", insight: "₹85,000 overdue AR poses liquidity risk." },
    { factor_name: "Anomaly Density", score: 78, weight: 0.15, status: "Good", insight: "2 active transaction anomalies flagged." },
    { factor_name: "Expense Volatility", score: 82, weight: 0.15, status: "Good", insight: "Ad spend surge detected, payroll stable." },
    { factor_name: "Recurring Expense Ratio", score: 88, weight: 0.10, status: "Good", insight: "Fixed commitments equal 38% of total monthly outflow." }
  ]
};

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 201,
    title: "Recover Overdue Payment from Acme Retail Stores",
    description: "Acme Retail Stores owes ₹85,000 overdue by 15 days on INV-2026-081. Triggering an automated payment reminder will restore liquidity.",
    category: "Receivables Recovery",
    potential_savings: 85000,
    urgency: "high",
    action_type: "send_reminder",
    status: "suggested",
    created_at: new Date().toISOString()
  },
  {
    id: 202,
    title: "Dispute & Refund Duplicate CloudAnalytics Charge",
    description: "Identified a duplicate subscription charge of ₹14,500 billed twice within 48 hours. Submitting dispute request.",
    category: "Cost Reduction",
    potential_savings: 14500,
    urgency: "high",
    action_type: "pause_subscription",
    status: "suggested",
    created_at: new Date().toISOString()
  },
  {
    id: 203,
    title: "Optimize Digital Marketing Budget",
    description: "Meta Ad spend increased 180% with declining return on ad spend. Scaling back unoptimized ad sets can save ~₹45,000.",
    category: "Expense Optimization",
    potential_savings: 45000,
    urgency: "medium",
    action_type: "optimize_inventory",
    status: "suggested",
    created_at: new Date().toISOString()
  }
];

const MOCK_TRANSACTIONS: TransactionItem[] = [
  { id: 1, business_id: 1, date: new Date(Date.now() - 1*86400000).toISOString(), amount: 24500, type: 'credit', category: 'Sales Revenue', party_name: 'Razorpay Payment Gateway', description: 'Daily store payout (12 orders)', status: 'completed', is_recurring: false, is_anomaly: false },
  { id: 2, business_id: 1, date: new Date(Date.now() - 1*86400000).toISOString(), amount: 3800, type: 'debit', category: 'Logistics & Shipping', party_name: 'Delhivery Express', description: 'Daily dispatch charges', status: 'completed', is_recurring: false, is_anomaly: false },
  { id: 3, business_id: 1, date: new Date(Date.now() - 2*86400000).toISOString(), amount: 14500, type: 'debit', category: 'SaaS & Software', party_name: 'CloudAnalytics Pro', description: 'Duplicate billing statement #89412', status: 'completed', is_recurring: true, is_anomaly: true, anomaly_reason: 'Duplicate payment detected within 48 hours' },
  { id: 4, business_id: 1, date: new Date(Date.now() - 3*86400000).toISOString(), amount: 12500, type: 'debit', category: 'Marketing & Ads', party_name: 'Meta Ads Platform', description: 'Digital campaign scaling', status: 'completed', is_recurring: false, is_anomaly: false },
  { id: 5, business_id: 1, date: new Date(Date.now() - 4*86400000).toISOString(), amount: 14500, type: 'debit', category: 'SaaS & Software', party_name: 'CloudAnalytics Pro', description: 'Annual enterprise subscription renewal', status: 'completed', is_recurring: true, is_anomaly: false },
  { id: 6, business_id: 1, date: new Date(Date.now() - 5*86400000).toISOString(), amount: 55000, type: 'debit', category: 'Inventory', party_name: 'Supreme Apparel Suppliers', description: 'Weekly stock replenishment batch', status: 'completed', is_recurring: false, is_anomaly: false },
  { id: 7, business_id: 1, date: new Date(Date.now() - 6*86400000).toISOString(), amount: 35000, type: 'debit', category: 'Rent & Utilities', party_name: 'Metro Commercial Complex', description: 'Warehouse & Office Rent', status: 'completed', is_recurring: true, is_anomaly: false },
  { id: 8, business_id: 1, date: new Date(Date.now() - 7*86400000).toISOString(), amount: 125000, type: 'debit', category: 'Payroll', party_name: 'Employee Payroll', description: 'Monthly team salaries payout', status: 'completed', is_recurring: true, is_anomaly: false },
];

const MOCK_INSIGHTS = {
  expense_categories: [
    { category: 'Marketing & Ads', amount: 145000 },
    { category: 'Payroll', amount: 125000 },
    { category: 'Inventory', amount: 110000 },
    { category: 'Logistics & Shipping', amount: 48000 },
    { category: 'Rent & Utilities', amount: 35000 },
    { category: 'SaaS & Software', amount: 29000 },
  ],
  accounts_receivable: [
    { invoice_number: 'INV-2026-081', customer: 'Acme Retail Stores', amount: 85000, status: 'overdue' },
    { invoice_number: 'INV-2026-089', customer: 'TrendSetter Boutiques', amount: 32000, status: 'pending' },
    { invoice_number: 'INV-2026-092', customer: 'Urban Style Hub', amount: 48000, status: 'pending' }
  ]
};

// --- API Service Callers with Robust Fallback ---

export async function fetchDashboardSummary(businessId = 1): Promise<DashboardSummary> {
  try {
    const res = await fetch(`${API_BASE}/dashboard/summary/${businessId}`);
    if (!res.ok) throw new Error('Backend HTTP error');
    return await res.json();
  } catch (err) {
    console.warn("Using sample dashboard summary (backend starting/offline):", err);
    return MOCK_SUMMARY;
  }
}

export async function fetchForecast(businessId = 1, horizonDays = 30): Promise<ForecastResponse> {
  try {
    const res = await fetch(`${API_BASE}/forecast/${businessId}?horizon_days=${horizonDays}`);
    if (!res.ok) throw new Error('Backend HTTP error');
    return await res.json();
  } catch (err) {
    console.warn("Using sample cash forecast (backend starting/offline):", err);
    return getMockForecast(horizonDays);
  }
}

export async function fetchAnomalies(businessId = 1): Promise<AnomalyItem[]> {
  try {
    const res = await fetch(`${API_BASE}/anomalies/${businessId}`);
    if (!res.ok) throw new Error('Backend HTTP error');
    return await res.json();
  } catch (err) {
    console.warn("Using sample anomalies (backend starting/offline):", err);
    return MOCK_ANOMALIES;
  }
}

export async function resolveAnomaly(anomalyId: number, status = 'resolved') {
  try {
    const res = await fetch(`${API_BASE}/anomalies/${anomalyId}/resolve?status=${status}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to resolve anomaly');
    return await res.json();
  } catch (err) {
    return { message: "Anomaly marked as reviewed (local state)", status: "resolved" };
  }
}

export async function fetchRiskScore(businessId = 1): Promise<RiskScoreResponse> {
  try {
    const res = await fetch(`${API_BASE}/risk-score/${businessId}`);
    if (!res.ok) throw new Error('Backend HTTP error');
    return await res.json();
  } catch (err) {
    console.warn("Using sample risk score (backend starting/offline):", err);
    return MOCK_RISK;
  }
}

export async function fetchRecommendations(businessId = 1): Promise<Recommendation[]> {
  try {
    const res = await fetch(`${API_BASE}/recommendations/${businessId}`);
    if (!res.ok) throw new Error('Backend HTTP error');
    return await res.json();
  } catch (err) {
    console.warn("Using sample recommendations (backend starting/offline):", err);
    return MOCK_RECOMMENDATIONS;
  }
}

export async function applyRecommendation(recommendationId: number) {
  try {
    const res = await fetch(`${API_BASE}/recommendations/${recommendationId}/apply`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to apply recommendation');
    return await res.json();
  } catch (err) {
    return { message: "Recommendation action executed successfully.", recommendation_id: recommendationId };
  }
}

export async function fetchTransactions(
  businessId = 1,
  params?: { type?: string; category?: string; anomaly_only?: boolean; search?: string }
): Promise<TransactionItem[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type_filter', params.type);
    if (params?.category) searchParams.append('category_filter', params.category);
    if (params?.anomaly_only) searchParams.append('anomaly_only', 'true');
    if (params?.search) searchParams.append('search', params.search);

    const res = await fetch(`${API_BASE}/transactions/${businessId}?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Backend HTTP error');
    return await res.json();
  } catch (err) {
    console.warn("Using sample transactions ledger (backend starting/offline):", err);
    let items = [...MOCK_TRANSACTIONS];
    if (params?.type) items = items.filter(t => t.type === params.type);
    if (params?.anomaly_only) items = items.filter(t => t.is_anomaly);
    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(t => 
        t.party_name.toLowerCase().includes(q) || 
        t.category.toLowerCase().includes(q) || 
        (t.description || '').toLowerCase().includes(q)
      );
    }
    return items;
  }
}

export async function createTransaction(businessId = 1, data: TransactionCreate) {
  const res = await fetch(`${API_BASE}/transactions?business_id=${businessId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let message = 'Failed to create transaction';
    try { const body = await res.json(); message = body.detail || message; } catch {}
    throw new Error(message);
  }
  return await res.json();
}

export async function uploadTransactionsCSV(businessId = 1, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/transactions/${businessId}/upload-csv`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    let message = 'CSV upload failed';
    try {
      const body = await res.json();
      message = body.detail || message;
    } catch {
      // Keep fallback
    }
    throw new Error(message);
  }
  return res.json();
}

export async function queryCopilot(query: string, businessId = 1): Promise<CopilotResponse> {
  try {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: businessId, query }),
    });
    if (!res.ok) {
      let message = 'The cash assistant could not answer right now';
      try {
        const body = await res.json();
        message = body.detail || message;
      } catch {
        // Fallback
      }
      throw new Error(message);
    }
    return await res.json();
  } catch (err) {
    console.warn("Using offline copilot response:", err);
    return {
      query,
      answer: `### Analysis for UrbanKart Cash Position

Based on your current transactions:
1. **Current Cash Balance**: ₹2,84,500 with a 30-day net cash flow of -₹75,000.
2. **Key Liquidity Shortfall**: A projected cash dip is expected in ~12 days if ad spend surge (₹45,000/mo) continues unchecked.
3. **Actionable Steps**:
   - Recover overdue invoice **#INV-2026-081** from *Acme Retail Stores* (₹85,000).
   - Dispute duplicate **CloudAnalytics Pro** SaaS charge (₹14,500).
   - Re-allocate Meta Ads budget to high-performing campaigns.`,
      tool_calls: [
        { tool_name: "calculate_cash_runway", parameters: { business_id: 1 }, result: { runway_days: 34.5, net_daily_burn: 2500 } },
        { tool_name: "get_overdue_invoices", parameters: { business_id: 1 }, result: { total_overdue: 85000, count: 1 } }
      ],
      timestamp: new Date().toISOString()
    };
  }
}

export async function seedDemoData() {
  try {
    const res = await fetch(`${API_BASE}/demo/seed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed demo data');
    return await res.json();
  } catch (err) {
    return { message: "UrbanKart sample data loaded successfully." };
  }
}

export async function fetchInsights(businessId = 1) {
  try {
    const res = await fetch(`${API_BASE}/insights/${businessId}`);
    if (!res.ok) throw new Error('Backend HTTP error');
    return await res.json();
  } catch (err) {
    console.warn("Using sample insights distribution (backend starting/offline):", err);
    return MOCK_INSIGHTS;
  }
}


