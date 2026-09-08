import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight,
  Bot,
  Sparkles,
  ChevronRight,
  Receipt,
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { DashboardSummary, ForecastResponse } from '../types';
import { RiskGauge } from '../components/RiskGauge';

interface DashboardPageProps {
  summary: DashboardSummary | null;
  forecast: ForecastResponse | null;
  onNavigate: (tab: string) => void;
  onOpenCopilot: () => void;
  onOpenCSVModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  forecast,
  onNavigate,
  onOpenCopilot,
  onOpenCSVModal
}) => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const activeSummary = summary || {
    business_name: "UrbanKart",
    currency: "INR",
    current_balance: 284500,
    total_inflow_30d: 420000,
    total_outflow_30d: 495000,
    net_cash_flow_30d: -75000,
    runway_days: 34.5,
    pending_receivables: 80000,
    overdue_receivables: 85000,
    upcoming_payables_7d: 47500,
    risk_score: 72,
    risk_level: "Medium Risk",
    active_anomalies_count: 2
  };

  const chartPoints = forecast?.points || [
    { date: 'Day 1', forecast_balance: 284500, projected_inflow: 18000, projected_outflow: 22000 },
    { date: 'Day 5', forecast_balance: 268000, projected_inflow: 16000, projected_outflow: 20000 },
    { date: 'Day 10', forecast_balance: 248000, projected_inflow: 15000, projected_outflow: 19000 },
    { date: 'Day 15', forecast_balance: 228000, projected_inflow: 17000, projected_outflow: 21000 },
    { date: 'Day 20', forecast_balance: 208000, projected_inflow: 18000, projected_outflow: 22000 },
    { date: 'Day 25', forecast_balance: 188000, projected_inflow: 16000, projected_outflow: 20000 },
    { date: 'Day 30', forecast_balance: 168000, projected_inflow: 15000, projected_outflow: 19000 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Shortfall Alert Banner */}
      {forecast?.projected_shortfall && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-zinc-950 border border-rose-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                Projected Cash Shortfall Detected ({forecast.shortfall_date})
              </h4>
              <p className="text-xs text-rose-300/80">
                Cash balance projected to fall below zero in ~12 days based on net burn velocity and vendor payables.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCopilot}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shrink-0 transition shadow-lg shadow-red-950/40 flex items-center space-x-2"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Copilot to Fix</span>
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Current Cash Balance */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Current Cash Balance</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {formatINR(activeSummary.current_balance)}
            </h3>
            <div className="mt-1 flex items-center space-x-1.5 text-[11px] font-medium text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Real-time ledger state</span>
            </div>
          </div>
        </div>

        {/* Card 2: 30-Day Net Cash Flow */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">30-Day Net Cash Flow</span>
            <div className={`p-2 rounded-xl ${activeSummary.net_cash_flow_30d >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {activeSummary.net_cash_flow_30d >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-extrabold tracking-tight ${activeSummary.net_cash_flow_30d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatINR(activeSummary.net_cash_flow_30d)}
            </h3>
            <div className="mt-1 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>In: {formatINR(activeSummary.total_inflow_30d)}</span>
              <span>Out: {formatINR(activeSummary.total_outflow_30d)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Estimated Runway */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Estimated Cash Runway</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {activeSummary.runway_days} Days
            </h3>
            <p className="mt-1 text-[11px] text-zinc-400">
              Based on net burn velocity
            </p>
          </div>
        </div>

        {/* Card 4: Overdue Receivables */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Overdue Receivables (AR)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {formatINR(activeSummary.overdue_receivables)}
            </h3>
            <button
              onClick={() => onNavigate('anomalies')}
              className="mt-1 text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center space-x-1"
            >
              <span>View Unpaid Customer Invoices</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid Section: Graph + Financial Health Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Cash Flow Graph & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visual Recharts Cash Flow Graph */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">30-Day Cash Flow Trajectory</h3>
                <p className="text-xs text-zinc-500">Predicted balance trend with seasonality & daily velocity</p>
              </div>
              <button
                onClick={() => onNavigate('forecast')}
                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
              >
                <span>Full Forecast Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Forecast Balance']}
                  />
                  <Area type="monotone" dataKey="forecast_balance" stroke="#ef4444" strokeWidth={3} fill="url(#dashBalanceGrad)" name="Cash Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('forecast')}
              className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 transition text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 group-hover:text-red-400">Cash Forecast</span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Holt-Winters confidence bounds</p>
            </button>

            <button
              onClick={() => onNavigate('anomalies')}
              className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 transition text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 group-hover:text-red-400">Anomaly Audit</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">{activeSummary.active_anomalies_count} Active</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Duplicate charges & cost spikes</p>
            </button>

            <button
              onClick={() => onNavigate('risk')}
              className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-red-500/40 transition text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 group-hover:text-red-400">Risk Score Center</span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">6-factor solvency breakdown</p>
            </button>
          </div>

        </div>

        {/* Right Col: Risk Score Gauge Widget */}
        <div className="glass-card p-6 flex flex-col items-center justify-between text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-white">Financial Health Gauge</h3>
            <p className="text-xs text-zinc-500">Multi-factor solvency index</p>
          </div>

          <div className="my-2">
            <RiskGauge score={activeSummary.risk_score} riskLevel={activeSummary.risk_level} />
          </div>

          <div className="w-full pt-4 border-t border-zinc-800 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Active Anomalies</span>
              <span className="font-bold text-rose-400">{activeSummary.active_anomalies_count} flagged</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Upcoming Payables (7d)</span>
              <span className="font-bold text-zinc-200">{formatINR(activeSummary.upcoming_payables_7d)}</span>
            </div>
            <button
              onClick={() => onNavigate('risk')}
              className="w-full mt-2 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-red-400 transition"
            >
              View Full Factor Breakdown
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

