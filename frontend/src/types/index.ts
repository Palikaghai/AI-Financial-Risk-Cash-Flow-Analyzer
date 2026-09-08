export interface DashboardSummary {
  business_name: string;
  currency: string;
  current_balance: number;
  total_inflow_30d: number;
  total_outflow_30d: number;
  net_cash_flow_30d: number;
  runway_days: number;
  pending_receivables: number;
  overdue_receivables: number;
  upcoming_payables_7d: number;
  risk_score: number;
  risk_level: string;
  active_anomalies_count: number;
}

export interface ForecastPoint {
  date: string;
  forecast_balance: number;
  lower_bound: number;
  upper_bound: number;
  projected_inflow: number;
  projected_outflow: number;
}

export interface ForecastResponse {
  business_id: number;
  horizon_days: number;
  current_balance: number;
  projected_shortfall: boolean;
  shortfall_date: string | null;
  min_projected_balance: number;
  points: ForecastPoint[];
}

export interface AnomalyItem {
  id: number;
  transaction_id?: number;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'ignored';
  financial_impact: number;
  detected_at: string;
}

export interface RiskFactor {
  factor_name: string;
  score: number;
  weight: number;
  status: 'Good' | 'Warning' | 'Critical';
  insight: string;
}

export interface RiskScoreResponse {
  overall_score: number;
  risk_level: string;
  runway_days: number;
  net_cash_flow_30d: number;
  factors: RiskFactor[];
  key_recommendation: string;
}

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: string;
  potential_savings: number;
  urgency: 'high' | 'medium' | 'low';
  action_type: string;
  status: 'suggested' | 'executed' | 'dismissed';
  created_at: string;
}

export interface ToolCallLog {
  tool_name: string;
  parameters: Record<string, any>;
  result: any;
}

export interface CopilotResponse {
  query: string;
  answer: string;
  tool_calls: ToolCallLog[];
  timestamp: string;
}

export interface TransactionCreate {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  customer_name?: string;
}

export interface TransactionItem {
  id: number;
  business_id: number;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  party_name: string;
  description?: string;
  status: string;
  is_recurring: boolean;
  is_anomaly: boolean;
  anomaly_reason?: string;
  anomaly_severity?: string;
}
