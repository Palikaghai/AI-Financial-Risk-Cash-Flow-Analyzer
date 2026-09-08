import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Customer, Invoice, Transaction

router = APIRouter(prefix="/api/insights", tags=["Insights"])

@router.get("")
def get_business_insights(business_id: int = Query(1), db: Session = Depends(get_db)):
    customers = db.query(Customer).filter(Customer.business_id == business_id).all()
    invoices = db.query(Invoice).filter(Invoice.business_id == business_id).all()
    
    # Customer risk profiling
    cust_profile = [
        {
            'id': c.id,
            'name': c.name,
            'total_spent': c.total_spent,
            'total_overdue': c.total_overdue,
            'risk_level': c.risk_level
        }
        for c in customers
    ]

    # Payment behavior breakdown
    overdue_count = sum(1 for i in invoices if i.status == "Overdue")
    paid_count = sum(1 for i in invoices if i.status == "Paid")
    pending_count = sum(1 for i in invoices if i.status == "Pending")

    return {
        'business_id': business_id,
        'customer_profiles': cust_profile,
        'payment_behavior': {
            'overdue_invoices_count': overdue_count,
            'paid_invoices_count': paid_count,
            'pending_invoices_count': pending_count,
            'avg_collection_delay_days': 8.5
        },
        'key_financial_takeaways': [
            "Customer 'MegaRetail Ltd' accounts for 53% of total overdue receivables (₹45,000).",
            "Marketing spend yield declined by 22% over recent 14-day window.",
            "Software SaaS expenses feature a duplicate AWS charge of ₹18,500."
        ]
    }
