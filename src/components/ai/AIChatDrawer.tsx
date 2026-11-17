import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, RotateCcw, AlertCircle, Copy, Check } from 'lucide-react';
import { geminiService } from '../../services/geminiService';
import { ChatMessage } from '../../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  'Which products need restocking?',
  'What is my current inventory valuation?',
  'Which products are moving fastest?',
  'Which products have low stock?',
  'Summarize this month’s stock movements',
  'Which products have no recent stock-out activity?',
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `### Inventory Intelligence AI Online\nI am connected to your live PostgreSQL inventory database. All answers are deterministically calculated from your products catalog, stock-in/out transactions, and supplier roster.\n\nSelect a prompt below or ask any question about your stock levels, valuation, or movement trends.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const response = await geminiService.askInventoryAssistant(textToSend, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error retrieving inventory intelligence: ${err?.message || 'Server error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation reset. Live database context reloaded. How can I assist you with your warehouse inventory?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-mono-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-mono-0 border-l border-mono-900 shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-mono-200 bg-mono-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-mono-950 text-mono-0">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-mono-950 uppercase tracking-tight">
                AI Inventory Intelligence
              </h3>
              <p className="font-mono text-[10px] text-mono-500 uppercase tracking-wider">
                Google Gemini &bull; Verified DB Context
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1.5 text-mono-500 hover:text-mono-950 hover:bg-mono-200 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-mono-500 hover:text-mono-950 hover:bg-mono-200 transition-colors"
              title="Close assistant"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-4 py-2.5 border-b border-mono-200 bg-mono-100/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-mono text-[10px] uppercase font-bold text-mono-500 whitespace-nowrap">
            Presets:
          </span>
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              disabled={loading}
              className="px-2.5 py-1 bg-mono-0 border border-mono-300 hover:border-mono-950 hover:bg-mono-950 hover:text-mono-0 transition-colors font-mono text-[10px] uppercase tracking-tight whitespace-nowrap flex-shrink-0 disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Message Thread */}
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
                      <span className="font-bold text-mono-950">AI Analyst</span>
                    </>
                  ) : (
                    <span>Administrator</span>
                  )}
                </div>

                <div
                  className={`p-4 max-w-[90%] text-xs leading-relaxed border relative group ${
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
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="absolute top-2 right-2 p-1 text-mono-400 hover:text-mono-950 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
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
                <span>Computing deterministic query...</span>
              </div>
              <div className="p-4 bg-mono-50 border border-mono-200 font-mono text-xs text-mono-600">
                Retrieving database records &amp; synthesizing response...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Read-Only Safety Disclaimer */}
        <div className="px-4 py-2 bg-mono-100 border-t border-mono-200 flex items-center gap-2 font-mono text-[10px] text-mono-500">
          <AlertCircle size={12} className="flex-shrink-0" />
          <span>Strict Read-Only Mode: AI cannot execute inventory modifications directly.</span>
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
            placeholder="Ask anything about stock, valuation, reorder needs..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={loading}
            className="flex-1 bg-mono-50 border border-mono-300 font-sans text-xs px-3 py-2.5 focus:outline-none focus:border-mono-950 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2.5 bg-mono-950 text-mono-0 hover:bg-mono-800 disabled:opacity-40 transition-colors"
            title="Send query"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
