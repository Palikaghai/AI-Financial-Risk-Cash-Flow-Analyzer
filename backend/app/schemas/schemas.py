from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class BusinessBase(BaseModel):
    name: str
    industry: str = "E-Commerce & Retail"
    currency: str = "INR"

class BusinessCreate(BusinessBase):
    pass

class BusinessOut(BusinessBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    date: datetime
    amount: float
    type: str # credit or debit
    category: str
    party_name: str
    description: Optional[str] = None
    status: str = "completed"
    is_recurring: bool = False
    is_anomaly: bool = False
    anomaly_reason: Optional[str] = None
    anomaly_severity: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    business_id: int
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    invoice_number: str
    customer_name: str
    amount: float
    issue_date: datetime
    due_date: datetime
    status: str = "pending"
    payment_terms: str = "Net 30"

class InvoiceOut(InvoiceBase):
    id: int
    business_id: int
    class Config:
        from_attributes = True

class ForecastPoint(BaseModel):
    date: str
    forecast_balance: float
    lower_bound: float
    upper_bound: float
    projected_inflow: float
    projected_outflow: float

class ForecastResponse(BaseModel):
    business_id: int
    horizon_days: int
    current_balance: float
    projected_shortfall: bool
    shortfall_date: Optional[str] = None
    min_projected_balance: float
    points: List[ForecastPoint]

class AnomalyItem(BaseModel):
    id: int
    transaction_id: Optional[int] = None
    title: str
    description: str
    category: str
    severity: str
    status: str
    financial_impact: float
    detected_at: datetime
    class Config:
        from_attributes = True

class RiskFactorBreakdown(BaseModel):
    factor_name: str
    score: float # 0 - 100 (where lower is worse risk, higher is healthier)
    weight: float
    status: str # Good, Warning, Critical
    insight: str

class RiskScoreResponse(BaseModel):
    overall_score: float # 0 - 100
    risk_level: str # Low Risk, Moderate Risk, High Risk, Critical
    runway_days: float
    net_cash_flow_30d: float
    factors: List[RiskFactorBreakdown]
    key_recommendation: str

class RecommendationOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    potential_savings: float
    urgency: str
    action_type: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class CopilotQueryRequest(BaseModel):
    business_id: int = 1
    query: str

class ToolCallLog(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]
    result: Any

class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    tool_calls: List[ToolCallLog]
    timestamp: datetime

class DashboardSummaryResponse(BaseModel):
    business_name: str
    currency: str
    current_balance: float
    total_inflow_30d: float
    total_outflow_30d: float
    net_cash_flow_30d: float
    runway_days: float
    pending_receivables: float
    overdue_receivables: float
    upcoming_payables_7d: float
    risk_score: float
    risk_level: str
    active_anomalies_count: int
