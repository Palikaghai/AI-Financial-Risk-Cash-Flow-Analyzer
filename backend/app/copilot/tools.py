import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models import Transaction, Invoice, Customer
from app.ml.forecasting import generate_cash_flow_forecast
from app.ml.anomaly_detection import detect_transaction_anomalies
from app.ml.risk_scoring import calculate_cashflow_risk_score

class CopilotToolRegistry:
    def __init__(self, db: Session, business_id: int):
        self.db = db
        self.business_id = business_id

    def get_cash_balance(self) -> Dict[str, Any]:
        """Tool to retrieve current liquid cash balance and net 30d cash position."""
        forecast_data = generate_cash_flow_forecast(self.db, self.business_id, forecast_days=1)
        curr_bal = forecast_data['current_balance']
        
        now = datetime.datetime.utcnow()
        thirty_days_ago = now - datetime.timedelta(days=30)
        recent_txs = self.db.query(Transaction).filter(
            Transaction.business_id == self.business_id,
            Transaction.date >= thirty_days_ago
        ).all()

        inflows = sum(t.amount for t in recent_txs if t.type.lower() == 'inflow')
        outflows = sum(t.amount for t in recent_txs if t.type.lower() == 'outflow')

        return {
            'current_cash_balance': curr_bal,
            'net_cash_flow_30d': inflows - outflows,
            'total_inflows_30d': inflows,
            'total_outflows_30d': outflows,
            'as_of_date': now.strftime('%Y-%m-%d %H:%M:%S')
        }

    def get_revenue(self, period_days: int = 30) -> Dict[str, Any]:
        """Tool to calculate total revenue, daily average, and trend comparison over N days."""
        now = datetime.datetime.utcnow()
        period_start = now - datetime.timedelta(days=period_days)
        prior_start = period_start - datetime.timedelta(days=period_days)

        recent_txs = self.db.query(Transaction).filter(
            Transaction.business_id == self.business_id,
            Transaction.type == 'inflow',
            Transaction.date >= period_start
        ).all()

        prior_txs = self.db.query(Transaction).filter(
            Transaction.business_id == self.business_id,
            Transaction.type == 'inflow',
            Transaction.date >= prior_start,
            Transaction.date < period_start
        ).all()

        current_rev = sum(t.amount for t in recent_txs)
        prior_rev = sum(t.amount for t in prior_txs) or 1.0

        change_pct = ((current_rev - prior_rev) / prior_rev) * 100.0

        return {
            'period_days': period_days,
            'total_revenue': current_rev,
            'daily_average': round(current_rev / max(1, period_days), 2),
            'prior_period_revenue': prior_rev,
            'trend_change_percent': round(change_pct, 1),
            'transaction_count': len(recent_txs)
        }

    def get_expenses(self, period_days: int = 30) -> Dict[str, Any]:
        """Tool to analyze total expenses and top category breakdown."""
        now = datetime.datetime.utcnow()
        period_start = now - datetime.timedelta(days=period_days)
        
        recent_txs = self.db.query(Transaction).filter(
            Transaction.business_id == self.business_id,
            Transaction.type == 'outflow',
            Transaction.date >= period_start
        ).all()

        total_exp = sum(t.amount for t in recent_txs)
        cat_map = {}
        for t in recent_txs:
            cat_map[t.category] = cat_map.get(t.category, 0.0) + t.amount

        category_breakdown = [
            {'category': k, 'amount': round(v, 2), 'percentage': round((v / total_exp * 100.0), 1) if total_exp > 0 else 0.0}
            for k, v in sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
        ]

        return {
            'period_days': period_days,
            'total_expenses': total_exp,
            'category_breakdown': category_breakdown,
            'transaction_count': len(recent_txs)
        }

    def get_forecast(self, days: int = 30) -> Dict[str, Any]:
        """Tool to retrieve cash flow forecast and identify potential shortages."""
        forecast_res = generate_cash_flow_forecast(self.db, self.business_id, forecast_days=days)
        return {
            'forecast_horizon_days': days,
            'current_balance': forecast_res['current_balance'],
            'lowest_predicted_balance': forecast_res['lowest_predicted_balance'],
            'cash_shortage_expected': forecast_res['cash_shortage_expected'],
            'cash_shortage_day': forecast_res['cash_shortage_day'],
            'confidence_score': forecast_res['confidence_score']
        }

    def get_anomalies(self, min_severity: str = "Low") -> Dict[str, Any]:
        """Tool to fetch detected transaction anomalies."""
        anoms = detect_transaction_anomalies(self.db, self.business_id)
        return {
            'total_anomalies': len(anoms),
            'anomalies': anoms
        }

    def get_overdue_receivables(self) -> Dict[str, Any]:
        """Tool to inspect overdue customer invoices and outstanding balances."""
        now = datetime.datetime.utcnow()
        overdue_invs = self.db.query(Invoice).filter(
            Invoice.business_id == self.business_id,
            Invoice.status.in_(["Pending", "Overdue"]),
            Invoice.due_date < now
        ).all()

        total_overdue = sum(i.amount for i in overdue_invs)
        items = [
            {
                'invoice_number': i.invoice_number,
                'customer_name': i.customer_name,
                'amount': i.amount,
                'due_date': i.due_date.strftime('%Y-%m-%d'),
                'overdue_days': (now - i.due_date).days
            }
            for i in overdue_invs
        ]

        return {
            'total_overdue_amount': total_overdue,
            'overdue_count': len(items),
            'overdue_invoices': items
        }

    def get_top_expenses(self, limit: int = 5) -> Dict[str, Any]:
        """Tool to get top individual outflow transactions."""
        txs = self.db.query(Transaction).filter(
            Transaction.business_id == self.business_id,
            Transaction.type == 'outflow'
        ).order_by(Transaction.amount.desc()).limit(limit).all()

        top_list = [
            {
                'id': t.id,
                'description': t.description,
                'amount': t.amount,
                'category': t.category,
                'date': t.date.strftime('%Y-%m-%d')
            }
            for t in txs
        ]
        return {
            'top_expenses': top_list
        }

    def calculate_risk_score(self) -> Dict[str, Any]:
        """Tool to run the Risk Scoring engine and explain contributing drivers."""
        return calculate_cashflow_risk_score(self.db, self.business_id)
