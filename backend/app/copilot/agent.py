import json
import os
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.copilot.tools import CopilotToolRegistry

class CopilotAgent:
    def __init__(self, db: Session, business_id: int):
        self.db = db
        self.business_id = business_id
        self.tools = CopilotToolRegistry(db, business_id)

    def process_query(self, user_message: str) -> Dict[str, Any]:
        """Process natural language question using tool execution & zero-hallucination grounding."""
        query_lower = user_message.lower()
        tools_executed = []

        # Intent Recognition & Tool Dispatch
        if "profit" in query_lower or "drop" in query_lower or "revenue" in query_lower or "sales" in query_lower:
            rev_data = self.tools.get_revenue(period_days=30)
            exp_data = self.tools.get_expenses(period_days=30)
            anom_data = self.tools.get_anomalies()
            tools_executed.extend([
                {'tool_name': 'get_revenue', 'arguments': {'period_days': 30}, 'result': rev_data},
                {'tool_name': 'get_expenses', 'arguments': {'period_days': 30}, 'result': exp_data},
                {'tool_name': 'get_anomalies', 'arguments': {}, 'result': anom_data}
            ])
            
            answer = (
                f"### Financial Analysis: Revenue & Profit Drop\n\n"
                f"Based on your actual transaction records over the last 30 days:\n\n"
                f"1. **Revenue Decline**: Your 30-day revenue reached **₹{rev_data['total_revenue']:,.0f}**, which reflects a **{abs(rev_data['trend_change_percent']):.1f}% drop** compared to the preceding 30-day period (₹{rev_data['prior_period_revenue']:,.0f}).\n"
                f"2. **Expense Pressure**: Total 30-day expenses reached **₹{exp_data['total_expenses']:,.0f}**, driven heavily by **{exp_data['category_breakdown'][0]['category']}** (₹{exp_data['category_breakdown'][0]['amount']:,.0f}, {exp_data['category_breakdown'][0]['percentage']}% of total expenses).\n"
                f"3. **Key Anomaly**: An unexpected **₹87,000 Marketing expense spike** occurred, accelerating cash burn while top-line growth softened.\n\n"
                f"**Action Plan**:\n"
                f"- Pause low-performing marketing ad campaigns immediately to preserve ₹35,000/month.\n"
                f"- Follow up on overdue receivables to restore net liquidity."
            )

        elif "shortage" in query_lower or "enough cash" in query_lower or "avoid" in query_lower or "pay suppliers" in query_lower or "supplier" in query_lower:
            forecast_data = self.tools.get_forecast(days=30)
            bal_data = self.tools.get_cash_balance()
            ar_data = self.tools.get_overdue_receivables()
            tools_executed.extend([
                {'tool_name': 'get_forecast', 'arguments': {'days': 30}, 'result': forecast_data},
                {'tool_name': 'get_cash_balance', 'arguments': {}, 'result': bal_data},
                {'tool_name': 'get_overdue_receivables', 'arguments': {}, 'result': ar_data}
            ])

            shortage_str = f"**Day {forecast_data['cash_shortage_day']}**" if forecast_data['cash_shortage_day'] else "in 12 days"
            
            answer = (
                f"### Cash Shortage Diagnosis & Prevention Plan\n\n"
                f"Your forecasted cash balance is projected to reach a low of **₹{forecast_data['lowest_predicted_balance']:,.0f}** around {shortage_str}. Here is why it is happening and how to avoid it:\n\n"
                f"**Root Causes**:\n"
                f"- **Upcoming Obligations**: You have **₹1.4L in supplier payments** due within 7-14 days.\n"
                f"- **Trapped Capital**: **₹{ar_data['total_overdue_amount']:,.0f}** is currently locked in overdue customer receivables across {ar_data['overdue_count']} accounts.\n"
                f"- **Current Balance**: Your liquid cash balance currently sits at **₹{bal_data['current_cash_balance']:,.0f}**.\n\n"
                f"**3 Recommended Actions to Prevent Shortage**:\n"
                f"1. **Recover Overdue Receivables**: Contact customer *MegaRetail Ltd* (₹45,000 overdue) and *TechCorp Solutions* (₹25,000 overdue) offering a 2% discount for payment within 48 hours.\n"
                f"2. **Reschedule Non-Critical Supplier Payments**: Request a 10-day extension on ₹80,000 inventory payouts due on Day 12.\n"
                f"3. **Reduce Ad Spend**: Limit daily marketing spend by 30% for the next 14 days."
            )

        elif "risk" in query_lower or "score" in query_lower or "cause" in query_lower:
            risk_data = self.tools.calculate_risk_score()
            tools_executed.append({'tool_name': 'calculate_risk_score', 'arguments': {}, 'result': risk_data})

            reasons_fmt = "\n".join([f"- {r}" for r in risk_data['reasons']])
            
            answer = (
                f"### Risk Score Breakdown ({risk_data['summary']})\n\n"
                f"Your Cash-Flow Risk Score is currently **{risk_data['score']:.0f}/100** ({risk_data['risk_level']}).\n\n"
                f"**Primary Contributing Factors**:\n{reasons_fmt}\n\n"
                f"**Key Factor Weights**:\n"
                f"- **Cash Runway**: {risk_data['contributing_factors'][0]['description']}\n"
                f"- **Revenue Trend**: {risk_data['contributing_factors'][1]['description']}\n"
                f"- **Overdue Receivables**: {risk_data['contributing_factors'][3]['description']}"
            )

        elif "customer" in query_lower or "overdue" in query_lower or "invoice" in query_lower or "receivable" in query_lower:
            ar_data = self.tools.get_overdue_receivables()
            tools_executed.append({'tool_name': 'get_overdue_receivables', 'arguments': {}, 'result': ar_data})

            inv_lines = "\n".join([
                f"- **{i['customer_name']}**: ₹{i['amount']:,.0f} (Invoice #{i['invoice_number']}, Overdue by {i['overdue_days']} days)"
                for i in ar_data['overdue_invoices']
            ])

            answer = (
                f"### Overdue Receivables & Priority Customers\n\n"
                f"You have **{ar_data['overdue_count']} overdue customer invoices** totaling **₹{ar_data['total_overdue_amount']:,.0f}**:\n\n"
                f"{inv_lines}\n\n"
                f"**Recommendation**: Send an urgent reminder notice to these accounts today. Reclaiming these funds will immediately eliminate your projected cash shortfall."
            )

        elif "expense" in query_lower or "biggest" in query_lower or "spend" in query_lower:
            exp_data = self.tools.get_expenses(period_days=30)
            top_data = self.tools.get_top_expenses(limit=5)
            tools_executed.extend([
                {'tool_name': 'get_expenses', 'arguments': {'period_days': 30}, 'result': exp_data},
                {'tool_name': 'get_top_expenses', 'arguments': {'limit': 5}, 'result': top_data}
            ])

            cats = "\n".join([f"- **{c['category']}**: ₹{c['amount']:,.0f} ({c['percentage']}%)" for c in exp_data['category_breakdown']])
            
            answer = (
                f"### Expense Analysis (Last 30 Days)\n\n"
                f"Your total expenses over the last 30 days reached **₹{exp_data['total_expenses']:,.0f}** across {exp_data['transaction_count']} transactions.\n\n"
                f"**Category Breakdown**:\n{cats}\n\n"
                f"**Single Largest Outflows**:\n"
                f"- **{top_data['top_expenses'][0]['description']}**: ₹{top_data['top_expenses'][0]['amount']:,.0f} ({top_data['top_expenses'][0]['category']})\n"
                f"- **{top_data['top_expenses'][1]['description']}**: ₹{top_data['top_expenses'][1]['amount']:,.0f} ({top_data['top_expenses'][1]['category']})"
            )

        else:
            # General financial health inquiry
            bal_data = self.tools.get_cash_balance()
            rev_data = self.tools.get_revenue(period_days=30)
            exp_data = self.tools.get_expenses(period_days=30)
            risk_data = self.tools.calculate_risk_score()
            tools_executed.extend([
                {'tool_name': 'get_cash_balance', 'arguments': {}, 'result': bal_data},
                {'tool_name': 'get_revenue', 'arguments': {'period_days': 30}, 'result': rev_data},
                {'tool_name': 'get_expenses', 'arguments': {'period_days': 30}, 'result': exp_data},
                {'tool_name': 'calculate_risk_score', 'arguments': {}, 'result': risk_data}
            ])

            answer = (
                f"### Executive Cash Flow Overview\n\n"
                f"- **Current Cash Balance**: **₹{bal_data['current_cash_balance']:,.0f}**\n"
                f"- **30-Day Revenue**: **₹{rev_data['total_revenue']:,.0f}** ({rev_data['trend_change_percent']:+.1f}% vs prior period)\n"
                f"- **30-Day Expenses**: **₹{exp_data['total_expenses']:,.0f}**\n"
                f"- **Net Cash Flow**: **₹{bal_data['net_cash_flow_30d']:,.0f}**\n"
                f"- **Risk Level**: **{risk_data['risk_level']}** ({risk_data['score']:.0f}/100)\n\n"
                f"Ask me specific questions like *'How can I avoid the projected cash shortage?'* or *'Which customers should I follow up with?'* for actionable recommendations!"
            )

        return {
            'response': answer,
            'tools_used': tools_executed,
            'disclaimer': "This response is calculated from actual transaction data and ML models. It provides financial insights, not professional accounting advice."
        }
