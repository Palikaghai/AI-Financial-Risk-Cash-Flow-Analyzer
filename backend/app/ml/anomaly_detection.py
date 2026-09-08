import datetime
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Transaction, Anomaly

def detect_transaction_anomalies(db: Session, business_id: int) -> List[Dict[str, Any]]:
    """Scan business transactions and identify anomalies, saving results to DB."""
    txs = db.query(Transaction).filter(Transaction.business_id == business_id).order_by(Transaction.date.asc()).all()
    if not txs:
        return []

    # Reset existing flags
    for tx in txs:
        tx.is_anomaly = False
        tx.anomaly_reason = None
        tx.anomaly_severity = None
    
    anomalies_found = []
    
    # Group by category to calculate standard deviations
    outflows = [t for t in txs if t.type.lower() == 'outflow']
    cat_amounts = {}
    for t in outflows:
        cat_amounts.setdefault(t.category, []).append(t.amount)

    cat_stats = {}
    for cat, val_list in cat_amounts.items():
        if len(val_list) >= 2:
            mean = float(np.mean(val_list))
            std = float(np.std(val_list))
            cat_stats[cat] = (mean, std if std > 0 else mean * 0.2)
        else:
            cat_stats[cat] = (float(val_list[0]), float(val_list[0]) * 0.2)

    # 1. Category Expense Spike Detection & High Single Outflow
    for tx in outflows:
        mean, std = cat_stats.get(tx.category, (5000.0, 1000.0))
        z_score = (tx.amount - mean) / std if std > 0 else 0
        
        if tx.amount > 50000 and z_score > 2.2:
            tx.is_anomaly = True
            tx.anomaly_severity = "High" if tx.amount < 80000 else "Critical"
            tx.anomaly_reason = f"₹{tx.amount:,.0f} {tx.category} expense is {z_score:.1f}x standard deviations higher than your average {tx.category} spend (₹{mean:,.0f})."
            
            anomalies_found.append({
                'transaction_id': tx.id,
                'title': f"Unusual {tx.category} Expense Spike",
                'amount': tx.amount,
                'category': tx.category,
                'severity': tx.anomaly_severity,
                'description': tx.anomaly_reason,
                'recommended_action': f"Review campaign ROI or vendor agreement for {tx.description} to prevent unbudgeted cash burn."
            })

    # 2. Duplicate Transaction Detection
    seen_txs = {}
    for tx in txs:
        key = (tx.amount, tx.category, tx.description)
        if key in seen_txs:
            prev_tx = seen_txs[key]
            time_diff = abs((tx.date - prev_tx.date).total_seconds())
            # If within 48 hours and same amount/description
            if time_diff <= 172800:
                tx.is_anomaly = True
                tx.anomaly_severity = "Medium"
                tx.anomaly_reason = f"Possible duplicate billing detected: ₹{tx.amount:,.0f} recorded twice within 48 hours of earlier transaction #{prev_tx.id}."
                
                anomalies_found.append({
                    'transaction_id': tx.id,
                    'title': "Duplicate Transaction Alert",
                    'amount': tx.amount,
                    'category': tx.category,
                    'severity': "Medium",
                    'description': tx.anomaly_reason,
                    'recommended_action': f"Verify payment gateway or vendor receipt for '{tx.description}' to confirm if charged twice."
                })
        seen_txs[key] = tx

    # Update Anomaly table in DB
    try:
        db.query(Anomaly).filter(Anomaly.business_id == business_id).delete()
        for a in anomalies_found:
            anom_record = Anomaly(
                business_id=business_id,
                transaction_id=a.get('transaction_id'),
                title=a['title'],
                description=a['description'],
                amount=a['amount'],
                severity=a['severity'],
                category=a['category'],
                recommended_action=a['recommended_action'],
                detected_at=datetime.datetime.utcnow()
            )
            db.add(anom_record)
        db.commit()
    except Exception:
        db.rollback()

    return anomalies_found
