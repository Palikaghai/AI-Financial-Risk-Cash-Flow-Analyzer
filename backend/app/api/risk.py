from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.risk import RiskScoreResponse
from app.ml.risk_scoring import calculate_cashflow_risk_score

router = APIRouter(prefix="/api/risk-score", tags=["Risk Score"])

@router.get("", response_model=RiskScoreResponse)
def get_risk_score_breakdown(business_id: int = Query(1), db: Session = Depends(get_db)):
    risk_info = calculate_cashflow_risk_score(db, business_id)
    return RiskScoreResponse(**risk_info)
