import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart as PieIcon, Receipt, Layers, Lightbulb, ArrowUpRight, AlertCircle } from 'lucide-react';
import { fetchInsights } from '../services/api';

export const InsightsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetchInsights(1);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#ef4444', '#a1a1aa', '#71717a'];
  const expenses = data?.expense_categories || [];
  const receivables = data?.accounts_receivable || [];
  const totalExpenses = expenses.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const totalReceivables = receivables.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const largestExpense = expenses.reduce((largest: any, item: any) => (
    !largest || Number(item.amount) > Number(largest.amount) ? item : largest
  ), null);

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
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">What deserves attention</h2>
            <p className="text-xs text-zinc-500 mt-1">A quick read of spending patterns and money still to collect.</p>
          </div>
          <Lightbulb className="w-5 h-5 text-red-500" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs">Loading analytics distributions...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <span className="text-xs font-semibold text-zinc-500">Tracked spending</span>
              <p className="text-2xl font-extrabold text-white mt-2">{formatINR(totalExpenses)}</p>
              <p className="text-[11px] text-zinc-600 mt-1">Across {expenses.length} categories</p>
            </div>
            <div className="glass-card p-5">
              <span className="text-xs font-semibold text-zinc-500">Still to collect</span>
              <p className="text-2xl font-extrabold text-red-400 mt-2">{formatINR(totalReceivables)}</p>
              <p className="text-[11px] text-zinc-600 mt-1">{receivables.length} open invoices</p>
            </div>
            <div className="glass-card p-5">
              <span className="text-xs font-semibold text-zinc-500">Largest cost area</span>
              <p className="text-lg font-extrabold text-white mt-2 truncate">{largestExpense?.category || 'No data yet'}</p>
              <p className="text-[11px] text-zinc-600 mt-1">{largestExpense ? formatINR(largestExpense.amount) : 'Add transactions to see this'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-red-950/30 border border-red-900/70 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-red-200">Collection opportunity</h3>
                <p className="text-xs text-red-200/70 mt-1">Follow up on open invoices before taking on new expenses.</p>
              </div>
            </div>
            <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 flex gap-3">
              <ArrowUpRight className="w-5 h-5 text-orange-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-zinc-200">Keep an eye on concentration</h3>
                <p className="text-xs text-zinc-500 mt-1">Your largest category is the first place to review for savings.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Expense Category Pie Chart */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Where money is going</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenses}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(data?.expense_categories || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Receivables Table */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Money still to collect</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="pb-2">Invoice</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {receivables.length > 0 ? receivables.map((inv: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 font-mono text-indigo-300">{inv.invoice_number}</td>
                      <td className="py-3 font-bold text-white">{inv.customer}</td>
                      <td className="py-3 font-mono font-bold text-slate-100">{formatINR(inv.amount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'overdue' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="py-10 text-center text-zinc-500">No open invoices yet. Add transactions or load sample data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        </div>
      )}

    </div>
  );
};
