import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Terminal, 
  Sparkles, 
  User
} from 'lucide-react';
import { CopilotResponse, ToolCallLog } from '../types';
import { queryCopilot } from '../services/api';
import { CopilotDrawer } from '../components/CopilotDrawer';

const renderAnswer = (text: string) => text.split('\n').map((line, index) => {
  const clean = line.replace(/^###?\s*/, '');
  const parts = clean.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
  const content = parts.map((part, partIndex) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={partIndex}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={partIndex}>{part}</React.Fragment>;
  });

  if (!clean.trim()) return <div key={index} className="h-2" />;
  if (/^###\s/.test(line)) return <h3 key={index} className="text-base font-bold text-white mb-1">{content}</h3>;
  if (/^\d+\.\s/.test(clean)) return <div key={index} className="pl-2 py-0.5">{content}</div>;
  if (clean.startsWith('- ')) return <div key={index} className="pl-2 py-0.5">• {content.slice(1)}</div>;
  return <div key={index}>{content}</div>;
});

export const CopilotPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; toolCalls?: ToolCallLog[] }>>([
    {
      sender: 'bot',
      text: `### Welcome to AI Cash-Flow Copilot

I can analyze your bank statement transactions, explain changes in your cash position, and recommend actions to prevent cash shortages.

#### Recommended Questions:
1. *"How can I avoid the projected cash shortage?"*
2. *"Show me transaction anomalies and duplicate charges."*
3. *"Which customer invoices are overdue?"*
4. *"Give me a 30-day cash flow forecast."*`
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCallLog[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const promptChips = [
    "How can I avoid the projected cash shortage?",
    "Show me duplicate or unusual transactions.",
    "Which customer invoices are overdue?",
    "Calculate my financial health score."
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || query;
    if (!textToSend.trim() || loading) return;

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await queryCopilot(textToSend, 1);
      setMessages(prev => [...prev, { sender: 'bot', text: res.answer, toolCalls: res.tool_calls }]);
      if (res.tool_calls && res.tool_calls.length > 0) {
        setActiveToolCalls(res.tool_calls);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The cash assistant could not answer right now.';
      setMessages(prev => [...prev, { sender: 'bot', text: message }]);
    } finally {
      setLoading(false);
    }
  };

  const openAuditDrawer = (tc?: ToolCallLog[]) => {
    if (tc && tc.length > 0) {
      setActiveToolCalls(tc);
    }
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">AI Cash-Flow Copilot</h2>
            <p className="text-xs text-zinc-400">Tool-grounded financial intelligence engine for your cash transactions.</p>
          </div>
        </div>

        <button
          onClick={() => openAuditDrawer()}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-red-300 text-xs font-semibold transition flex items-center space-x-2"
        >
          <Terminal className="w-4 h-4 text-red-400" />
          <span>View Source Audits ({activeToolCalls.length})</span>
        </button>
      </div>

      {/* Suggest Chips */}
      <div className="flex flex-wrap gap-2">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-700 text-zinc-300 hover:text-white text-xs transition active:scale-95 flex items-center space-x-1.5"
          >
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="glass-card p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
              msg.sender === 'user'
                ? 'bg-red-600 text-white rounded-br-none shadow-lg shadow-red-950/40'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-none'
            }`}>
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80 mb-2">
                <div className="flex items-center space-x-2 font-bold text-[11px]">
                  {msg.sender === 'user' ? (
                    <>
                      <User className="w-3.5 h-3.5 text-zinc-200" />
                      <span>Account Owner</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-zinc-300">Cash Assistant</span>
                    </>
                  )}
                </div>

                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <button
                    onClick={() => openAuditDrawer(msg.toolCalls)}
                    className="text-[10px] font-bold text-red-400 hover:underline flex items-center space-x-1"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Checked {msg.toolCalls.length} sources</span>
                  </button>
                )}
              </div>

              {/* Message text */}
              <div className="whitespace-pre-wrap font-sans text-xs text-zinc-100">
                {msg.sender === 'bot' ? renderAnswer(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 flex items-center space-x-3">
              <Bot className="w-4 h-4 text-red-400 animate-spin" />
              <span>Analyzing ledger & running tool queries...</span>
            </div>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="glass-card p-2 flex items-center space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your cash flow or transactions..."
          className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!query.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-red-950/40 flex items-center space-x-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      {/* Tool Drawer */}
      <CopilotDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        toolCalls={activeToolCalls}
      />

    </div>
  );
};

