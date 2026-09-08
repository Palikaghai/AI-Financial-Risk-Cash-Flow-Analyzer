import datetime
import random
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.db.models import User, Business, Transaction, Customer, Invoice, Forecast, Anomaly, Recommendation, AIConversation
from app.ml.forecasting import generate_cash_flow_forecast
from app.ml.anomaly_detection import detect_transaction_anomalies
from app.ml.risk_scoring import calculate_cashflow_risk_score

def seed_urbankart_demo_data(db: Session) -> Business:
    """Populate database with synthetic 6-month transaction dataset for UrbanKart."""
    # Reset existing records
    Base.metadata.create_all(bind=engine)
    
    # 1. User & Business
    user = db.query(User).filter(User.email == "demo@urbankart.in").first()
    if not user:
        user = User(
            email="demo@urbankart.in",
            name="Rajesh Sharma",
            hashed_password="demo_password_hash_2026"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    business = db.query(Business).filter(Business.owner_id == user.id).first()
    if not business:
        business = Business(
            name="UrbanKart Electronics",
            industry="E-Commerce & Retail",
            currency="INR",
            owner_id=user.id
        )
        db.add(business)
        db.commit()
        db.refresh(business)
    else:
        # Clear existing transactions/invoices for clean re-seed
        db.query(Transaction).filter(Transaction.business_id == business.id).delete()
        db.query(Invoice).filter(Invoice.business_id == business.id).delete()
        db.query(Customer).filter(Customer.business_id == business.id).delete()
        db.query(Anomaly).filter(Anomaly.business_id == business.id).delete()
        db.query(Recommendation).filter(Recommendation.business_id == business.id).delete()
        db.commit()

    # 2. Customers
    cust_data = [
        {"name": "MegaRetail Ltd", "email": "accounts@megaretail.in", "spent": 340000.0, "overdue": 45000.0, "risk": "High"},
        {"name": "TechCorp Solutions", "email": "billing@techcorp.com", "spent": 210000.0, "overdue": 25000.0, "risk": "Medium"},
        {"name": "Metro Mart Pvt Ltd", "email": "finance@metromart.in", "spent": 185000.0, "overdue": 15000.0, "risk": "Medium"},
        {"name": "Apex Digital", "email": "pay@apexdigital.in", "spent": 290000.0, "overdue": 0.0, "risk": "Low"},
        {"name": "Pulse Retail", "email": "info@pulseretail.com", "spent": 150000.0, "overdue": 0.0, "risk": "Low"}
    ]
    
    customers = []
    for cd in cust_data:
        c = Customer(
            business_id=business.id,
            name=cd['name'],
            email=cd['email'],
            total_spent=cd['spent'],
            total_overdue=cd['overdue'],
            risk_level=cd['risk']
        )
        db.add(c)
        customers.append(c)
    db.commit()

    # 3. Generate 6 Months Historical Transactions
    today = datetime.datetime.utcnow().date()
    start_date = today - datetime.timedelta(days=180)
    
    tx_list = []
    
    # Base daily pattern over 180 days
    current = start_date
    while current <= today:
        days_from_end = (today - current).days
        
        # Scenario 1: Revenue decline over last 21 days (-14%)
        if days_from_end <= 21:
            daily_rev_mean = 14000.0
        else:
            daily_rev_mean = 18500.0
            
        # Daily sales inflows (1 to 3 transactions)
        num_sales = random.randint(1, 3)
        for i in range(num_sales):
            amt = round(random.normalvariate(daily_rev_mean / num_sales, 1500.0), 2)
            if amt > 1000:
                tx_list.append(Transaction(
                    business_id=business.id,
                    date=datetime.datetime.combine(current, datetime.time(random.randint(9, 18), random.randint(0, 59))),
                    description=f"E-Commerce Sales Order #{random.randint(10000, 99999)}",
                    amount=amt,
                    type="inflow",
                    category="Sales",
                    customer_name=random.choice(customers).name,
                    status="Completed"
                ))

        # Regular Daily Outflows (Shipping, Operations)
        ops_amt = round(random.uniform(1200.0, 3500.0), 2)
        tx_list.append(Transaction(
            business_id=business.id,
            date=datetime.datetime.combine(current, datetime.time(11, 30)),
            description="Logistics & Shipping Fulfillment",
            amount=ops_amt,
            type="outflow",
            category="Shipping",
            status="Completed"
        ))

        # Monthly Recurring Outflows (Salaries on 1st, Rent on 5th, Software on 10th, Taxes on 20th)
        if current.day == 1:
            tx_list.append(Transaction(
                business_id=business.id,
                date=datetime.datetime.combine(current, datetime.time(10, 0)),
                description="Staff Monthly Salaries Disbursement",
                amount=75000.0,
                type="outflow",
                category="Salaries",
                status="Completed"
            ))
        elif current.day == 5:
            tx_list.append(Transaction(
                business_id=business.id,
                date=datetime.datetime.combine(current, datetime.time(10, 0)),
                description="Warehouse & Office Lease Rent",
                amount=45000.0,
                type="outflow",
                category="Rent",
                status="Completed"
            ))
        elif current.day == 10:
            tx_list.append(Transaction(
                business_id=business.id,
                date=datetime.datetime.combine(current, datetime.time(14, 0)),
                description="Cloud Infrastructure & ERP SaaS",
                amount=14500.0,
                type="outflow",
                category="Software",
                status="Completed"
            ))

        current += datetime.timedelta(days=1)

    # Scenario 2: Large Unexpected Marketing Expense Spike (₹87,000 5 days ago)
    tx_list.append(Transaction(
        business_id=business.id,
        date=datetime.datetime.combine(today - datetime.timedelta(days=5), datetime.time(15, 45)),
        description="Premium Growth Ad Campaign - Scale Media",
        amount=87000.0,
        type="outflow",
        category="Marketing",
        status="Completed"
    ))

    # Scenario 5: Duplicate SaaS Transaction Anomaly (AWS Billed twice 3 days ago & 2 days ago)
    tx_list.append(Transaction(
        business_id=business.id,
        date=datetime.datetime.combine(today - datetime.timedelta(days=3), datetime.time(12, 0)),
        description="AWS Web Hosting Monthly Instance",
        amount=18500.0,
        type="outflow",
        category="Software",
        status="Completed"
    ))
    tx_list.append(Transaction(
        business_id=business.id,
        date=datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(12, 15)),
        description="AWS Web Hosting Monthly Instance",
        amount=18500.0,
        type="outflow",
        category="Software",
        status="Completed"
    ))

    # Save all transactions
    db.add_all(tx_list)
    db.commit()

    # Scenario 3: Overdue Customer Invoices (₹85,000 overdue)
    invoices = [
        Invoice(
            business_id=business.id,
            customer_name="MegaRetail Ltd",
            invoice_number="INV-2026-089",
            amount=45000.0,
            issue_date=datetime.datetime.combine(today - datetime.timedelta(days=35), datetime.time(9, 0)),
            due_date=datetime.datetime.combine(today - datetime.timedelta(days=12), datetime.time(9, 0)),
            status="Overdue",
            overdue_days=12
        ),
        Invoice(
            business_id=business.id,
            customer_name="TechCorp Solutions",
            invoice_number="INV-2026-094",
            amount=25000.0,
            issue_date=datetime.datetime.combine(today - datetime.timedelta(days=30), datetime.time(9, 0)),
            due_date=datetime.datetime.combine(today - datetime.timedelta(days=8), datetime.time(9, 0)),
            status="Overdue",
            overdue_days=8
        ),
        Invoice(
            business_id=business.id,
            customer_name="Metro Mart Pvt Ltd",
            invoice_number="INV-2026-098",
            amount=15000.0,
            issue_date=datetime.datetime.combine(today - datetime.timedelta(days=25), datetime.time(9, 0)),
            due_date=datetime.datetime.combine(today - datetime.timedelta(days=5), datetime.time(9, 0)),
            status="Overdue",
            overdue_days=5
        ),
        Invoice(
            business_id=business.id,
            customer_name="Apex Digital",
            invoice_number="INV-2026-102",
            amount=38000.0,
            issue_date=datetime.datetime.combine(today - datetime.timedelta(days=10), datetime.time(9, 0)),
            due_date=datetime.datetime.combine(today + datetime.timedelta(days=10), datetime.time(9, 0)),
            status="Pending",
            overdue_days=0
        )
    ]
    db.add_all(invoices)
    db.commit()

    # Trigger ML engines to generate initial forecasts, anomaly alerts, and risk score
    detect_transaction_anomalies(db, business.id)
    generate_cash_flow_forecast(db, business.id, forecast_days=30)
    calculate_cashflow_risk_score(db, business.id)

    return business
