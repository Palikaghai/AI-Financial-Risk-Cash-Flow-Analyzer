import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, Zap, RefreshCw, Send, DollarSign } from 'lucide-react';
import { RiskScoreResponse, Recommendation } from '../types';
import { fetchRiskScore, fetchRecommendations, applyRecommendation } from '../services/api';
import { RiskGauge } from '../components/RiskGauge';

interface RiskCenterPageProps {
  onOpenCopilot: () => void;
}

export const RiskCenterPage: React.FC<RiskCenterPageProps> = ({ onOpenCopilot }) => {
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const [rScore, rRecs] = await Promise.all([
        fetchRiskScore(1),
        fetchRecommendations(1)
      ]);
      setRiskData(rScore);
      setRecommendations(rRecs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, []);

  const handleApplyRec = async (id: number) => {
    try {
      await applyRecommendation(id);
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'executed' } : r));
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Explainable Risk & Solvency Center</h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              0 - 100 Financial Index
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transparent scoring engine calculating runway, revenue momentum, expense ratios, & overdue AR
          </p>
        </div>

        <button
          onClick={loadRiskData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center space-x-2 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Recalculate Score</span>
        </button>
      </div>

      {/* Main Grid: Gauge + Key Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gauge Widget */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-200">Overall Health Score</h3>
          {riskData ? (
            <RiskGauge score={riskData.overall_score} riskLevel={riskData.risk_level} />
          ) : (
            <div className="py-12 text-xs text-slate-500 animate-pulse">Calculating score...</div>
          )}
          <p className="text-xs text-slate-400 max-w-xs mt-2">
            Weighted composite of 6 quantitative financial factors
          </p>
        </div>

        {/* Priority Recommendation Callout */}
        <div className="lg:col-span-2 glass-card p-6 bg-gradient-to-br from-slate-900 via-slate-900/80 to-indigo-950/40 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Top Priority Intervention</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {riskData?.key_recommendation || "Loading intervention strategy..."}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Executing this priority action will instantly improve your solvency index and prevent cash depletion.
            </p>
          </div>

          <div className="mt-6 flex items-center space-x-3">
            <button
              onClick={onOpenCopilot}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <span>Ask Copilot to Auto-Execute</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 6 Factor Breakdown Section */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">6 Factor Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskData?.factors.map((f, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{f.factor_name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  f.status === 'Good' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  f.status === 'Warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {f.score}/100 ({f.status})
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    f.score >= 80 ? 'bg-emerald-500' : f.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${f.score}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-400">{f.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Actionable Recommendations</h3>
        
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    rec.urgency === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {rec.urgency} Urgency
                  </span>
                  <span className="text-xs font-bold text-indigo-300">{rec.category}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                <p className="text-xs text-slate-300 max-w-2xl">{rec.description}</p>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto shrink-0 space-y-2">
                <span className="text-sm font-extrabold text-emerald-400">
                  Potential Impact: +{formatINR(rec.potential_savings)}
                </span>
                
                {rec.status === 'executed' ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Action Applied</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyRec(rec.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow shadow-indigo-600/20 flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Execute Action</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
