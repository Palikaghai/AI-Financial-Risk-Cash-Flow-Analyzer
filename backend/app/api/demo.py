from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.seed_data import seed_urbankart_demo_data

router = APIRouter(prefix="/api/demo", tags=["Demo"])

@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    business = seed_urbankart_demo_data(db)
    return {
        "status": "success",
        "message": "UrbanKart synthetic 6-month transaction dataset seeded successfully!",
        "business_id": business.id,
        "business_name": business.name
    }
