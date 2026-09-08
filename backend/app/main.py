from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import engine, Base, SessionLocal
from app.seed_data import seed_urbankart_demo_data

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.transactions import router as transactions_router
from app.api.forecast import router as forecast_router
from app.api.anomalies import router as anomalies_router
from app.api.risk import router as risk_router
from app.api.recommendations import router as recommendations_router
from app.api.copilot import router as copilot_router
from app.api.insights import router as insights_router
from app.api.demo import router as demo_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed initial data on startup if database is fresh
db = SessionLocal()
try:
    seed_urbankart_demo_data(db)
finally:
    db.close()

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Grade Full-Stack Financial Intelligence & Cash-Flow Copilot Engine for Merchants and SMBs.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(transactions_router)
app.include_router(forecast_router)
app.include_router(anomalies_router)
app.include_router(risk_router)
app.include_router(recommendations_router)
app.include_router(copilot_router)
app.include_router(insights_router)
app.include_router(demo_router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs": "/docs",
        "demo_business": "UrbanKart Electronics"
    }
