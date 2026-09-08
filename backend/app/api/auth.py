from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, Business

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_email: str
    business_id: int
    business_name: str

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Fallback quick demo user login
        user = db.query(User).first()
        if not user:
            from app.seed_data import seed_urbankart_demo_data
            business = seed_urbankart_demo_data(db)
            user = business.owner

    business = db.query(Business).filter(Business.owner_id == user.id).first()
    return AuthResponse(
        access_token=f"demo_token_user_{user.id}",
        user_name=user.name,
        user_email=user.email,
        business_id=business.id if business else 1,
        business_name=business.name if business else "UrbanKart Electronics"
    )
