import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Line 
} from 'recharts';
import { TrendingUp, AlertTriangle, Calendar, Info, RefreshCcw } from 'lucide-react';
import { ForecastResponse } from '../types';
import { fetchForecast } from '../services/api';

interface ForecastPageProps {
  onOpenCopilot: () => void;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({ onOpenCopilot }) => {
  const [horizon, setHorizon] = useState<number>(30);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadForecast = async (h: number) => {
    try {
      setLoading(true);
      const res = await fetchForecast(1, h);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(horizon);
  }, [horizon]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">ML Cash-Flow Forecast Engine</h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Holt-Winters + Seasonality
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive time-series projection with variance confidence bands
          </p>
        </div>

        {/* Horizon Tabs */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setHorizon(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                horizon === d
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Shortfall Alert */}
      {data?.projected_shortfall && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Projected Liquidity Shortfall on {data.shortfall_date}</span>
              <p className="text-rose-400/80">Net daily burn velocity will dip cash balance below ₹0 safety line.</p>
            </div>
          </div>
          <button
            onClick={onOpenCopilot}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
          >
            Ask Copilot to Solve
          </button>
        </div>
      )}

      {/* Main Time Series Chart */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Projected Cash Balance & Confidence Interval</h3>
          <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
              <span>Predicted Balance</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-500/40 inline-block"></span>
              <span>Confidence Band (± Uncertainty)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-500 text-xs">
            Calculating time-series forecasting regression...
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.points || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                />
                <Area type="monotone" dataKey="upper_bound" stroke="none" fill="url(#confidenceGrad)" name="Upper Bound" />
                <Area type="monotone" dataKey="lower_bound" stroke="none" fill="url(#confidenceGrad)" name="Lower Bound" />
                <Area type="monotone" dataKey="forecast_balance" stroke="#6366f1" strokeWidth={3} fill="url(#balanceGrad)" name="Forecast Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Inflow vs Outflow Projection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <span className="text-xs text-slate-400 font-semibold">Min Projected Balance</span>
          <h4 className={`text-xl font-extrabold mt-1 ${data && data.min_projected_balance < 0 ? 'text-rose-400' : 'text-slate-100'}`}>
            {data ? formatINR(data.min_projected_balance) : '₹0'}
          </h4>
        </div>
        <div className="glass-card p-4">
          <span className="text-xs text-slate-400 font-semibold">Avg Daily Projected Inflow</span>
          <h4 className="text-xl font-extrabold text-emerald-400 mt-1">
            {data?.points ? formatINR(data.points.reduce((a,b)=>a+b.projected_inflow, 0) / data.points.length) : '₹0'}
          </h4>
        </div>
        <div className="glass-card p-4">
          <span className="text-xs text-slate-400 font-semibold">Avg Daily Projected Outflow</span>
          <h4 className="text-xl font-extrabold text-rose-400 mt-1">
            {data?.points ? formatINR(data.points.reduce((a,b)=>a+b.projected_outflow, 0) / data.points.length) : '₹0'}
          </h4>
        </div>
      </div>

    </div>
  );
};
