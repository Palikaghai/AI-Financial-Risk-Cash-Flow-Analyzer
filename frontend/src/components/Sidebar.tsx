import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  AlertOctagon, 
  ShieldAlert, 
  Bot, 
  Receipt, 
  PieChart 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  anomaliesCount: number;
  riskScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  anomaliesCount,
  riskScore
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'forecast', label: 'Cash forecast', icon: TrendingUp },
    { 
      id: 'anomalies', 
      label: 'Unusual activity', 
      icon: AlertOctagon, 
      badge: anomaliesCount > 0 ? `${anomaliesCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    },
    { 
      id: 'risk', 
      label: 'Financial health',
      icon: ShieldAlert,
      badge: `${riskScore}/100`,
      badgeColor: riskScore >= 75 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    { id: 'copilot', label: 'Ask about your cash', icon: Bot, isHighlight: true },
    { id: 'transactions', label: 'Transactions & import', icon: Receipt },
    { id: 'insights', label: 'Trends & insights', icon: PieChart },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-zinc-800 bg-zinc-950/80 p-4 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Workspace
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white border border-red-500 shadow-sm shadow-red-950/40'
                      : item.isHighlight
                      ? 'bg-zinc-900 text-red-300 hover:bg-zinc-800 border border-red-950'
                      : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isHighlight ? 'text-red-400' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-200 font-bold">
            <span>Good to know</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Keep an eye on cash coming in, bills going out, and anything that needs a closer look.
          </p>
        </div>
      </div>
    </aside>
  );
};
