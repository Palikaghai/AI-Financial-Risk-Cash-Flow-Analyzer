from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Recommendation
from app.schemas.dashboard import RecommendationItem
from app.ml.risk_scoring import calculate_cashflow_risk_score

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationItem])
def get_recommendations(business_id: int = Query(1), db: Session = Depends(get_db)):
    # Calculate fresh recommendations
    calculate_cashflow_risk_score(db, business_id)
    recs = db.query(Recommendation).filter(Recommendation.business_id == business_id).all()
    return [
        RecommendationItem(
            id=r.id,
            title=r.title,
            problem=r.problem,
            evidence=r.evidence,
            recommended_action=r.recommended_action,
            expected_impact=r.expected_impact,
            priority=r.priority
        )
        for r in recs
    ]
