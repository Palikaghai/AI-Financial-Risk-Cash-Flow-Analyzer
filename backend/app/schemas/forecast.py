from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ForecastPoint(BaseModel):
    date: str
    predicted_balance: float
    expected_inflow: float
    expected_outflow: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    business_id: int
    current_balance: float
    forecast_7d: List[ForecastPoint]
    forecast_14d: List[ForecastPoint]
    forecast_30d: List[ForecastPoint]
    lowest_predicted_balance: float
    cash_shortage_day: Optional[str] = None
    cash_shortage_expected: bool = False
    confidence_score: float = 0.88
