import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle, ShieldAlert, DollarSign, Filter, RefreshCw } from 'lucide-react';
import { AnomalyItem } from '../types';
import { fetchAnomalies, resolveAnomaly } from '../services/api';

interface AnomaliesPageProps {
  onOpenCopilot: () => void;
}

export const AnomaliesPage: React.FC<AnomaliesPageProps> = ({ onOpenCopilot }) => {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAnomalies(1);
      setAnomalies(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await resolveAnomaly(id, 'resolved');
      setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const activeAnomalies = anomalies.filter(a => a.status === 'active');
  const resolvedAnomalies = anomalies.filter(a => a.status === 'resolved');
  const totalImpact = activeAnomalies.reduce((sum, a) => sum + a.financial_impact, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Transaction Anomaly Detector</h2>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {activeAnomalies.length} Active Flags
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statistical Z-score outliers, category expense surges, and duplicate payment detection engine
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center space-x-2 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Re-scan Ledger</span>
        </button>
      </div>

      {/* Impact Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-rose-500">
          <span className="text-xs font-semibold text-slate-400">Total Financial Risk Exposure</span>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-1">{formatINR(totalImpact)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Potential savings from resolution</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-400">Active Anomalies</span>
          <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{activeAnomalies.length} Items</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires audit or payment dispute</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold text-slate-400">Resolved / Recovered</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{resolvedAnomalies.length} Items</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Successfully audited transactions</p>
        </div>
      </div>

      {/* Active Anomalies Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300">Active Transaction Anomalies</h3>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Running multi-vector anomaly detection scan...</div>
        ) : activeAnomalies.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span>No active anomalies detected! All transactions match baseline patterns.</span>
          </div>
        ) : (
          activeAnomalies.map((anom) => (
            <div key={anom.id} className="glass-card p-5 border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    anom.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {anom.severity} Severity
                  </span>
                  <span className="text-xs font-bold text-indigo-300">{anom.category}</span>
                  <span className="text-[11px] text-slate-500">Detected: {new Date(anom.detected_at).toLocaleDateString()}</span>
                </div>

                <h4 className="text-base font-bold text-white">{anom.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{anom.description}</p>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800 space-y-2">
                <span className="text-base font-extrabold text-rose-400">
                  {formatINR(anom.financial_impact)}
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResolve(anom.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={onOpenCopilot}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
                  >
                    Ask Copilot
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
