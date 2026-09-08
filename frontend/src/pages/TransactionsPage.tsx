import React, { useState, useEffect } from 'react';
import { Search, Filter, UploadCloud, AlertOctagon, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { TransactionItem, TransactionCreate } from '../types';
import { createTransaction } from '../services/api';
import { fetchTransactions } from '../services/api';

interface TransactionsPageProps {
  onOpenCSVModal: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onOpenCSVModal }) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [anomalyOnly, setAnomalyOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<TransactionCreate>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'debit',
    category: '',
    customer_name: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchTransactions(1, {
        type: typeFilter || undefined,
        anomaly_only: anomalyOnly,
        search: search || undefined
      });
      setTransactions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, anomalyOnly, search]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & CSV Trigger */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Ledger & Transaction Importer</h2>
          <p className="text-xs text-slate-400 mt-1">Full historical transaction audit ledger with real-time anomaly tagging</p>
        </div>

        <button
            onClick={onOpenCSVModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Bank/Gateway CSV</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
          >
            <span>{showForm ? 'Cancel' : 'Add Transaction'}</span>
          </button>
      </div>

      {/* Filter Bar */}
      {showForm && (
            <div className="glass-card p-4 mb-4">
              <h3 className="text-lg font-bold text-white mb-2">Add New Transaction</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" className="p-2 rounded bg-slate-800 text-white" value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })} />
                <input type="text" placeholder="Party / Vendor" className="p-2 rounded bg-slate-800 text-white"
                  value={formData.customer_name || ''}
                  onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
                <input type="text" placeholder="Category" className="p-2 rounded bg-slate-800 text-white"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })} />
                <select className="p-2 rounded bg-slate-800 text-white"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as 'credit' | 'debit' })}>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
                <input type="number" placeholder="Amount" className="p-2 rounded bg-slate-800 text-white"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                <input type="text" placeholder="Description" className="p-2 rounded bg-slate-800 text-white"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <button className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                onClick={async () => {
                  try {
                    await createTransaction(1, formData);
                    setShowForm(false);
                    loadData();
                  } catch (e) {
                    console.error(e);
                    alert('Failed to add transaction');
                  }
                }}>
                Save Transaction
              </button>
            </div>
          )}
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search party, category, or note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Types (Credit & Debit)</option>
                <option value="credit">Credits (Inflows)</option>
                <option value="debit">Debits (Outflows)</option>
              </select>
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anomalyOnly}
                  onChange={(e) => setAnomalyOnly(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>Anomalies Only</span>
              </label>
            </div>
          </div>

      {/* Ledger Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading ledger entries...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No matching transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Party / Vendor</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5 text-slate-400 font-mono">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">
                      {tx.party_name}
                      {tx.description && <p className="text-[11px] font-normal text-slate-400">{tx.description}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{tx.category}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tx.type === 'credit' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span className="capitalize">{tx.type}</span>
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 font-extrabold font-mono ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatINR(tx.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      {tx.is_anomaly ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold" title={tx.anomaly_reason}>
                          <AlertOctagon className="w-3 h-3" />
                          <span>Anomaly Flagged</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 capitalize">{tx.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
