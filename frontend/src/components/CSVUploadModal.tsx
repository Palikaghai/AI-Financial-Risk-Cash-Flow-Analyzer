import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { uploadTransactionsCSV } from '../services/api';

interface UploadBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVUploadModal: React.FC<UploadBoxProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const chooseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccessMsg(null);
    }
  };

  const dropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setSuccessMsg(null);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = `Date,Party / Payee,Category,Type,Amount,Description
2026-09-01,Razorpay Payment Gateway,Sales Revenue,Credit,45000.00,Store payouts (22 orders)
2026-09-02,Delhivery Express,Logistics & Shipping,Debit,4800.00,Package dispatches
2026-09-03,CloudAnalytics Pro,SaaS & Software,Debit,14500.00,Enterprise analytics suite
2026-09-04,Meta Ads Platform,Marketing & Ads,Debit,12000.00,Weekly ad spend campaign
2026-09-05,Supreme Apparel Suppliers,Inventory,Debit,55000.00,Weekly stock replenishment`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_cashflow_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a valid CSV file first.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await uploadTransactionsCSV(1, file);
      setSuccessMsg(res.message || "CSV parsed & imported successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to parse CSV file. Please check column format.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-card p-6 border border-zinc-800 shadow-2xl relative rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Import Transaction Ledger</h3>
            <p className="text-xs text-zinc-400">Upload bank or payment gateway CSV to recalculate cash flow & anomalies</p>
          </div>
        </div>

        {/* Drag & Drop Box */}
        <div
          className="my-4 p-6 border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-xl bg-zinc-950/80 text-center flex flex-col items-center justify-center transition cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={dropFile}
        >
          <FileText className="w-10 h-10 text-red-400 mb-2" />
          <p className="text-sm font-semibold text-zinc-200">
            {file ? file.name : "Drag & drop CSV file here or click to browse"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Supports Date, Amount / Credit / Debit, Category, Vendor & Notes</p>

          <input
            type="file"
            accept=".csv"
            onChange={chooseFile}
            className="mt-4 text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
          />
        </div>

        {/* Sample CSV Download Helper */}
        <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
          <span className="text-zinc-400">Need a test template?</span>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center space-x-1.5 text-red-400 hover:text-red-300 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition shadow-lg shadow-red-950/40 flex items-center space-x-2"
          >
            {uploading ? "Processing CSV..." : "Import Ledger"}
          </button>
        </div>
      </div>
    </div>
  );
};

