from typing import List, Optional, Dict
from pydantic import BaseModel

class AnomalyAlert(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    severity: str
    description: str
    recommended_action: str

class RecommendationItem(BaseModel):
    id: int
    title: str
    problem: str
    evidence: str
    recommended_action: str
    expected_impact: str
    priority: str

class InsightItem(BaseModel):
    category: str
    title: str
    summary: str
    metric: str
    type: str # warning, positive, neutral

class DashboardSummary(BaseModel):
    business_name: str
    current_cash_balance: float
    total_revenue_30d: float
    total_expenses_30d: float
    net_cash_flow_30d: float
    accounts_receivable: float
    upcoming_payments_7d: float
    risk_score: float
    risk_level: str
    forecasted_min_balance_30d: float
    revenue_vs_expenses: List[Dict[str, float]] # [{date, revenue, expenses}]
    cash_flow_timeline: List[Dict[str, float]] # [{date, balance}]
    expense_breakdown: List[Dict[str, Any]] # [{category, amount, percentage}]
    recent_anomalies: List[AnomalyAlert]
    ai_insights: List[InsightItem]
    recommendations: List[RecommendationItem]
