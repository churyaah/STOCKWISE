import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { geminiService, AIAnalysisResult } from '../../services/geminiService';
import { Sparkles, RefreshCw } from 'lucide-react';

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
    <Card
      title="Executive Intelligence Brief"
      subtitle="AI-synthesized inventory status & capital liquidity"
      headerAction={
        <Button
          size="sm"
          variant="outline"
          onClick={fetchSummary}
          disabled={loading}
          icon={<RefreshCw size={12} className={loading ? 'animate-spin' : ''} />}
        >
          Regenerate
        </Button>
      }
      className="bg-mono-50 border-mono-900"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-mono-950 text-mono-0 flex-shrink-0 mt-1">
          <Sparkles size={18} />
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2 animate-pulse py-2">
              <div className="h-4 bg-mono-200 w-3/4" />
              <div className="h-3 bg-mono-200 w-full" />
              <div className="h-3 bg-mono-200 w-5/6" />
            </div>
          ) : data ? (
            <div className="font-sans text-xs text-mono-800 leading-relaxed whitespace-pre-wrap space-y-3">
              {data.summary}
            </div>
          ) : (
            <p className="font-mono text-xs text-mono-500">
              Unable to generate executive briefing at this moment.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
