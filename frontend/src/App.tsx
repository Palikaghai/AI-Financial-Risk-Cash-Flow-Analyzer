import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CSVUploadModal } from './components/CSVUploadModal';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { RiskCenterPage } from './pages/RiskCenterPage';
import { CopilotPage } from './pages/CopilotPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InsightsPage } from './pages/InsightsPage';

import { fetchDashboardSummary, fetchForecast } from './services/api';
import { DashboardSummary, ForecastResponse } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [sumRes, fcRes] = await Promise.all([
        fetchDashboardSummary(1),
        fetchForecast(1, 30)
      ]);
      setSummary(sumRes);
      setForecast(fcRes);
    } catch (err) {
      console.error("Error loading app data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 font-sans">
      
      {/* Top Header */}
      <Navbar
        onRefresh={loadData}
        onOpenCopilot={() => setActiveTab('copilot')}
        activeTab={activeTab}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          anomaliesCount={summary?.active_anomalies_count || 0}
          riskScore={summary?.risk_score || 72}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              forecast={forecast}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenCopilot={() => setActiveTab('copilot')}
              onOpenCSVModal={() => setIsCSVModalOpen(true)}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastPage
              onOpenCopilot={() => setActiveTab('copilot')}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomaliesPage
              onOpenCopilot={() => setActiveTab('copilot')}
            />
          )}

          {activeTab === 'risk' && (
            <RiskCenterPage
              onOpenCopilot={() => setActiveTab('copilot')}
            />
          )}

          {activeTab === 'copilot' && (
            <CopilotPage />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              onOpenCSVModal={() => setIsCSVModalOpen(true)}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsPage />
          )}
        </main>
      </div>

      {/* CSV Importer Modal */}
      <CSVUploadModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onSuccess={loadData}
      />

    </div>
  );
}

export default App;
