from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.ml.anomaly_detection import detect_transaction_anomalies

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])

@router.get("")
def get_anomalies_list(business_id: int = Query(1), db: Session = Depends(get_db)):
    anomalies = detect_transaction_anomalies(db, business_id)
    return {
        'business_id': business_id,
        'total_anomalies': len(anomalies),
        'anomalies': anomalies
    }
