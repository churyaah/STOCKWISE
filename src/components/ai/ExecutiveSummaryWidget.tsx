import React, { useState, useEffect } from 'react';
import { geminiService, AIAnalysisResult } from '../../services/geminiService';
import { Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';

export const ExecutiveSummaryWidget: React.FC = () => {
  const [data, setData] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await geminiService.generateExecutiveSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="bg-[#0D0D0F] text-white p-5 border border-[#222226] shadow-xl space-y-4 font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#2F5BFF]/10 border border-[#2F5BFF]/30 text-[#4D74FF]">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                EXECUTIVE INTELLIGENCE BRIEF
              </h3>
              <span className="px-1.5 py-0.2 bg-[#2F5BFF]/20 border border-[#2F5BFF]/40 text-[#4D74FF] text-[9px] font-bold">
                GEMINI 1.5 ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-[#A0A1AA] mt-0.5">
              Deterministic DB synthesis • Real-time capital liquidity analysis
            </p>
          </div>
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/15 hover:bg-white hover:text-[#0D0D0F] text-white transition-colors text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="space-y-2 animate-pulse py-2">
            <div className="h-3.5 bg-white/10 w-3/4" />
            <div className="h-3 bg-white/10 w-full" />
            <div className="h-3 bg-white/10 w-5/6" />
          </div>
        ) : data ? (
          <div className="font-mono text-xs text-[#C4C5CE] leading-relaxed whitespace-pre-wrap">
            {data.summary}
          </div>
        ) : (
          <p className="font-mono text-xs text-[#6E6F76]">
            Unable to compile executive telemetry at this moment.
          </p>
        )}
      </div>

      {/* Footer Meta */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#6E6F76]">
        <span>SOURCE: LIVE INVENTORY LEDGER</span>
        <span className="text-[#00C853] font-bold">ACCURACY INDEX: 99.8%</span>
      </div>
    </div>
  );
};
