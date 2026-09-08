from typing import List
from pydantic import BaseModel

class ContributingFactor(BaseModel):
    factor: str
    impact: str # High Negative, Medium Negative, Positive, etc.
    score_contribution: float
    description: str

class RiskScoreResponse(BaseModel):
    score: float # 0 to 100
    risk_level: str # Low, Medium, High, Critical
    summary: str
    reasons: List[str]
    contributing_factors: List[ContributingFactor]
    last_updated: str
