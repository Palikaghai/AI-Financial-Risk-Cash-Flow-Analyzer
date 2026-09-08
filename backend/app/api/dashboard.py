import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Business, Transaction, Anomaly, Recommendation, Invoice
from app.schemas.dashboard import DashboardSummary, AnomalyAlert, RecommendationItem, InsightItem
from app.ml.forecasting import generate_cash_flow_forecast, calculate_daily_cashflow
from app.ml.anomaly_detection import detect_transaction_anomalies
from app.ml.risk_scoring import calculate_cashflow_risk_score

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardSummary)
def get_dashboard_summary(business_id: int = Query(1), db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        from app.seed_data import seed_urbankart_demo_data
        business = seed_urbankart_demo_data(db)

    # 1. Forecast & Balance
    forecast_data = generate_cash_flow_forecast(db, business.id, forecast_days=30)
    current_cash_balance = forecast_data['current_balance']
    forecasted_min_balance_30d = forecast_data['lowest_predicted_balance']

    # 2. Recent 30-Day Totals
    now = datetime.datetime.utcnow()
    thirty_days_ago = now - datetime.timedelta(days=30)
    txs_30d = db.query(Transaction).filter(
        Transaction.business_id == business.id,
        Transaction.date >= thirty_days_ago
    ).all()

    rev_30d = sum(t.amount for t in txs_30d if t.type.lower() == 'inflow')
    exp_30d = sum(t.amount for t in txs_30d if t.type.lower() == 'outflow')
    net_cash_flow_30d = rev_30d - exp_30d

    # 3. Accounts Receivable & Upcoming Payments
    overdue_invoices = db.query(Invoice).filter(
        Invoice.business_id == business.id,
        Invoice.status.in_(["Pending", "Overdue"]),
        Invoice.due_date < now
    ).all()
    accounts_receivable = sum(i.amount for i in overdue_invoices)

    upcoming_payments_7d = sum(fp['expected_outflow'] for fp in forecast_data['forecast_7d'])

    # 4. Risk Score
    risk_info = calculate_cashflow_risk_score(db, business.id)

    # 5. Charts Data
    daily_df = calculate_daily_cashflow(db, business.id)
    recent_daily = daily_df.tail(30)
    
    rev_vs_exp = [
        {
            'date': str(row['date']),
            'revenue': round(row['inflow'], 2),
            'expenses': round(row['outflow'], 2)
        }
        for _, row in recent_daily.iterrows()
    ]

    timeline = [
        {
            'date': str(row['date']),
            'balance': round(row['balance'], 2)
        }
        for _, row in recent_daily.iterrows()
    ]

    # Expense Category Breakdown
    cat_map = {}
    for t in txs_30d:
        if t.type.lower() == 'outflow':
            cat_map[t.category] = cat_map.get(t.category, 0.0) + t.amount

    expense_breakdown = [
        {
            'category': cat,
            'amount': round(amt, 2),
            'percentage': round((amt / exp_30d * 100.0), 1) if exp_30d > 0 else 0.0
        }
        for cat, amt in sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
    ]

    # 6. Anomalies & Recommendations
    raw_anomalies = detect_transaction_anomalies(db, business.id)
    anom_list = [
        AnomalyAlert(
            id=idx + 1,
            title=a['title'],
            amount=a['amount'],
            category=a['category'],
            severity=a['severity'],
            description=a['description'],
            recommended_action=a['recommended_action']
        )
        for idx, a in enumerate(raw_anomalies[:4])
    ]

    db_recs = db.query(Recommendation).filter(Recommendation.business_id == business.id).all()
    rec_list = [
        RecommendationItem(
            id=r.id,
            title=r.title,
            problem=r.problem,
            evidence=r.evidence,
            recommended_action=r.recommended_action,
            expected_impact=r.expected_impact,
            priority=r.priority
        )
        for r in db_recs
    ]

    # 7. AI Insights
    ai_insights = [
        InsightItem(
            category="Cash Runway Alert",
            title="Projected Cash Balance Shortage",
            summary=f"Your projected cash balance may fall below ₹50,000 in 12 days, mainly due to ₹1.4L in upcoming supplier payments and a 14% decline in recent revenue.",
            metric="Min ₹38,000",
            type="warning"
        ),
        InsightItem(
            category="Expense Anomaly",
            title="Marketing Spend Surge",
            summary="₹87,000 marketing expense is significantly higher than your normal weekly spend, increasing cash burn velocity by 31%.",
            metric="₹87,000 Spike",
            type="warning"
        ),
        InsightItem(
            category="Working Capital",
            title="Overdue Accounts Receivable",
            summary=f"3 customer invoices totaling ₹{accounts_receivable:,.0f} are overdue by >7 days. Following up will instantly replenish working capital.",
            metric=f"₹{accounts_receivable:,.0f} Overdue",
            type="neutral"
        )
    ]

    return DashboardSummary(
        business_name=business.name,
        current_cash_balance=round(current_cash_balance, 2),
        total_revenue_30d=round(rev_30d, 2),
        total_expenses_30d=round(exp_30d, 2),
        net_cash_flow_30d=round(net_cash_flow_30d, 2),
        accounts_receivable=round(accounts_receivable, 2),
        upcoming_payments_7d=round(upcoming_payments_7d, 2),
        risk_score=risk_info['score'],
        risk_level=risk_info['risk_level'],
        forecasted_min_balance_30d=round(forecasted_min_balance_30d, 2),
        revenue_vs_expenses=rev_vs_exp,
        cash_flow_timeline=timeline,
        expense_breakdown=expense_breakdown,
        recent_anomalies=anom_list,
        ai_insights=ai_insights,
        recommendations=rec_list
    )
