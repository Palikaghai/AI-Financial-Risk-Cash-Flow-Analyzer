import datetime
import io
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Transaction, Business
from app.schemas.transaction import TransactionResponse, TransactionUploadSummary, TransactionCreate
from app.ml.anomaly_detection import detect_transaction_anomalies
from app.ml.forecasting import generate_cash_flow_forecast
from app.ml.risk_scoring import calculate_cashflow_risk_score

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    business_id: int = Query(1),
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    anomalies_only: bool = False,
    limit: int = 200,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.business_id == business_id)
    if category:
        query = query.filter(Transaction.category == category)
    if type:
        query = query.filter(Transaction.type == type)
    if anomalies_only:
        query = query.filter(Transaction.is_anomaly == True)
    if search:
        query = query.filter(
            Transaction.description.ilike(f"%{search}%") |
            Transaction.category.ilike(f"%{search}%") |
            Transaction.customer_name.ilike(f"%{search}%")
        )

    txs = query.order_by(Transaction.date.desc()).limit(limit).all()
    return txs

71: @router.post("/", response_model=TransactionResponse)
72: async def create_transaction(
73:     transaction: TransactionCreate,
74:     business_id: int = Query(1),
75:     db: Session = Depends(get_db)
76: ):
77:     # Create Transaction record
78:     new_tx = Transaction(
79:         business_id=business_id,
80:         date=transaction.date,
81:         description=transaction.description,
82:         amount=abs(transaction.amount),
83:         type=transaction.type.lower(),
84:         category=transaction.category,
85:         customer_name=transaction.customer_name,
86:         status="Completed"
87:     )
88:     db.add(new_tx)
89:     db.commit()
90:     db.refresh(new_tx)
91:     return new_tx

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    # Standardize column headers
    df.columns = [c.strip().lower() for c in df.columns]
    required = {'date', 'description', 'amount', 'type'}
    if not required.issubset(set(df.columns)):
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns. Must include: {', '.join(required)}"
        )

    inflows, outflows = 0, 0
    new_tx_records = []
    
    for _, row in df.iterrows():
        try:
            tx_date = pd.to_datetime(row['date']).to_pydatetime()
            amt = float(row['amount'])
            tx_type = str(row['type']).strip().lower()
            if tx_type not in ['inflow', 'outflow']:
                tx_type = 'inflow' if amt > 0 else 'outflow'
                amt = abs(amt)
            
            category = str(row.get('category', 'Uncategorized')).strip()
            if category == 'nan' or not category:
                category = 'General'
                
            cust_name = str(row.get('customer', row.get('customer_name', ''))).strip()
            if cust_name == 'nan':
                cust_name = None

            if tx_type == 'inflow':
                inflows += 1
            else:
                outflows += 1

            new_tx = Transaction(
                business_id=business_id,
                date=tx_date,
                description=str(row['description']).strip(),
                amount=abs(amt),
                type=tx_type,
                category=category,
                customer_name=cust_name,
                status="Completed"
            )
            new_tx_records.append(new_tx)
        except Exception:
            continue

    if not new_tx_records:
        raise HTTPException(status_code=400, detail="No valid transaction rows found in CSV.")

    db.add_all(new_tx_records)
    db.commit()

    # Post-upload pipeline processing
    anoms = detect_transaction_anomalies(db, business_id)
    generate_cash_flow_forecast(db, business_id)
    risk_info = calculate_cashflow_risk_score(db, business_id)

    return TransactionUploadSummary(
        total_processed=len(new_tx_records),
        inflows_count=inflows,
        outflows_count=outflows,
        anomalies_detected=len(anoms),
        risk_score_updated=risk_info['score']
    )
