import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { geminiService } from '../../services/geminiService';
import { RestockInsightCard } from './RestockInsightCard';
import { ExecutiveSummaryWidget } from './ExecutiveSummaryWidget';
import { ChatMessage, Product } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AIAssistantViewProps {
  onTriggerStockIn: (product: Product) => void;
}

const SUGGESTED_QUESTIONS = [
  'Which products need restocking?',
  'What is my current inventory valuation?',
  'Which products are moving fastest?',
  'Which products have low stock?',
  'Summarize this month’s stock movements',
  'Which products have no recent stock-out activity?',
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ onTriggerStockIn }) => {
  const { products, suppliers } = useData();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### Welcome to Inventory Intelligence AI
I am your deterministic analysis partner. I have direct real-time read access to your PostgreSQL database.
- Every figure I report is computed from your live catalog, transaction ledger, and supplier records.
- I will never invent numbers, prices, or inventory quantities.
- I am strictly read-only to ensure your stock records remain tamper-free.

Select a question below or ask me anything!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const response = await geminiService.askInventoryAssistant(q, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Failed to query intelligence engine: ${err?.message || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Briefing Widget */}
      <ExecutiveSummaryWidget />

      {/* Main Grid: Chatbot Terminal (Left 2 cols) & Restock Table (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Chat Assistant Terminal */}
        <div className="lg:col-span-7 flex flex-col h-[650px] bg-mono-0 border border-mono-200">
          {/* Header */}
          <div className="p-4 border-b border-mono-200 bg-mono-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-mono-950 text-mono-0">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-mono-950 tracking-tight uppercase">
                  Natural-Language Intelligence Terminal
                </h3>
                <p className="font-mono text-[10px] text-mono-500 uppercase">
                  Google Gemini &bull; Deterministic DB Query Execution
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw size={12} />}
              onClick={() =>
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: 'assistant',
                    content: 'Context refreshed. How can I assist you with your warehouse inventory analysis?',
                    timestamp: new Date().toISOString(),
                  },
                ])
              }
            >
              Reset
            </Button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-mono-100/50 border-b border-mono-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <HelpCircle size={14} className="text-mono-400 ml-1 flex-shrink-0" />
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 bg-mono-0 border border-mono-300 hover:bg-mono-950 hover:text-mono-0 text-mono-800 transition-colors font-mono text-[10px] uppercase whitespace-nowrap disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              const isAI = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-mono-400 mb-1 uppercase">
                    {isAI ? (
                      <>
                        <Bot size={12} className="text-mono-950" />
                        <span className="font-bold text-mono-950">AI Assistant</span>
                      </>
                    ) : (
                      <span>Administrator</span>
                    )}
                  </div>

                  <div
                    className={`p-4 max-w-[85%] text-xs leading-relaxed border relative group ${
                      isAI
                        ? 'bg-mono-50 border-mono-200 text-mono-900'
                        : 'bg-mono-950 border-mono-950 text-mono-0 font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {msg.content}
                    </div>

                    {isAI && (
                      <button
                        onClick={() => copyText(msg.id, msg.content)}
                        className="absolute top-2 right-2 p-1 text-mono-400 hover:text-mono-950 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-mono-400 mb-1 uppercase">
                  <Bot size={12} />
                  <span>Processing deterministic query...</span>
                </div>
                <div className="p-4 bg-mono-50 border border-mono-200 font-mono text-xs text-mono-600">
                  Retrieving database rows &amp; evaluating metrics...
                </div>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Safety Notice */}
          <div className="px-4 py-2 bg-mono-100 border-t border-mono-200 flex items-center gap-2 font-mono text-[10px] text-mono-500">
            <AlertCircle size={12} className="flex-shrink-0" />
            <span>Strict Read-Only Mode: AI cannot alter stock records or ledger transactions.</span>
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-mono-200 bg-mono-0 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask an inventory question (e.g. Which products need restocking?)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-mono-50 border border-mono-300 font-sans text-xs px-3 py-2.5 focus:outline-none focus:border-mono-950 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              icon={<Send size={13} />}
            >
              Submit
            </Button>
          </form>
        </div>

        {/* Restocking Recommendations Table (Right 5 cols) */}
        <div className="lg:col-span-5">
          <RestockInsightCard
            products={products}
            suppliers={suppliers}
            onTriggerStockIn={onTriggerStockIn}
          />
        </div>
      </div>
    </div>
  );
};
