import React, { useState } from 'react';
import { 
  Building2, 
  RefreshCw, 
  Bot, 
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { seedDemoData } from '../services/api';

interface NavbarProps {
  onRefresh: () => void;
  onOpenCopilot: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, onOpenCopilot, activeTab }) => {
  const [seeding, setSeeding] = useState(false);
  const [seededNotice, setSeededNotice] = useState(false);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await seedDemoData();
      setSeededNotice(true);
      onRefresh();
      setTimeout(() => setSeededNotice(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-zinc-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand & Business Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-950/50">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-lg text-white tracking-tight">Cashflow Desk</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">A clear view of what is coming in and going out</p>
            </div>
          </div>

          <div className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 space-x-2">
            <Building2 className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-200">Sample business</span>
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-xs text-zinc-500 font-medium">INR</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50"
            title="Load sample transactions"
          >
            <span>{seeding ? 'Loading sample data...' : 'Load sample data'}</span>
          </button>

          <button
            onClick={onOpenCopilot}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all duration-200 active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Ask about your cash</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-700 text-zinc-500 hover:text-white transition"
            title="Refresh Financial Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {seededNotice && (
        <div className="mt-2 text-center py-1.5 px-4 bg-red-950/40 border border-red-900 rounded-lg text-red-300 text-xs font-medium animate-fadeIn">
          Sample cash-flow data is ready to explore.
        </div>
      )}
    </header>
  );
};
