from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.forecast import ForecastResponse
from app.ml.forecasting import generate_cash_flow_forecast

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])

@router.get("", response_model=ForecastResponse)
def get_forecast_data(
    business_id: int = Query(1),
    days: int = Query(30),
    db: Session = Depends(get_db)
):
    res = generate_cash_flow_forecast(db, business_id, forecast_days=days)
    return ForecastResponse(**res)
