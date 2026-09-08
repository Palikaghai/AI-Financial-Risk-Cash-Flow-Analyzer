from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class TransactionBase(BaseModel):
    date: datetime
    description: str
    amount: float
    type: str # inflow or outflow
    category: str
    customer_name: Optional[str] = None
    status: str = "Completed"

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    business_id: int
    is_anomaly: bool = False
    anomaly_reason: Optional[str] = None
    anomaly_severity: Optional[str] = None

    class Config:
        from_attributes = True

class TransactionUploadSummary(BaseModel):
    total_processed: int
    inflows_count: int
    outflows_count: int
    anomalies_detected: int
    risk_score_updated: float
