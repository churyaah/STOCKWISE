import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { isSupabaseConfigured } from '../../services/supabase';
import {
  Database,
  Sparkles,
  Building,
  RotateCcw,
  Key,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useData();
  const { profile } = useAuth();

  const [businessName, setBusinessName] = useState(settings.business_name);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol);
  const [defaultThreshold, setDefaultThreshold] = useState(String(settings.low_stock_threshold_default));
  const [sensitivity, setSensitivity] = useState(settings.ai_restock_sensitivity);

  // Gemini Key Override
  const [geminiKey, setGeminiKey] = useState(
    localStorage.getItem('inv_mgr_gemini_key') || ''
  );
  const [keySaved, setKeySaved] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const supabaseActive = isSupabaseConfigured();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      business_name: businessName,
      currency_symbol: currencySymbol,
      low_stock_threshold_default: parseInt(defaultThreshold, 10) || 10,
      ai_restock_sensitivity: sensitivity as any,
    });
  };

  const handleSaveGeminiKey = () => {
    if (geminiKey.trim()) {
      localStorage.setItem('inv_mgr_gemini_key', geminiKey.trim());
    } else {
      localStorage.removeItem('inv_mgr_gemini_key');
    }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const copyEnvSample = () => {
    const text = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key\nVITE_GEMINI_API_KEY=your-gemini-key`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Database & Cloud Architecture Status */}
      <Card
        title="Database &amp; Backend Infrastructure"
        subtitle="PostgreSQL schema, Supabase Auth & Edge Functions status"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-mono-50 border border-mono-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-mono-950 text-mono-0">
                <Database size={18} />
              </div>
              <div>
                <p className="font-sans font-bold text-sm text-mono-950">
                  {supabaseActive ? 'Supabase PostgreSQL (Connected)' : 'Local Synchronized Database (Active)'}
                </p>
                <p className="font-mono text-xs text-mono-600 mt-0.5">
                  {supabaseActive
                    ? 'Connected with Row Level Security & atomic RPC transactions.'
                    : 'Running persistent offline storage engine with identical schema & validation.'}
                </p>
              </div>
            </div>

            <span
              className={`font-mono text-xs px-2.5 py-1 uppercase border font-bold ${
                supabaseActive
                  ? 'bg-mono-950 text-mono-0 border-mono-950'
                  : 'bg-mono-150 text-mono-900 border-mono-400'
              }`}
            >
              {supabaseActive ? 'Live Cloud' : 'Persistent Local'}
            </span>
          </div>

          <div className="p-4 border border-mono-200 bg-mono-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase font-bold text-mono-950">
                Supabase Environment Variables (.env)
              </span>
              <button
                onClick={copyEnvSample}
                className="font-mono text-xs flex items-center gap-1.5 text-mono-600 hover:text-mono-950"
              >
                {copiedEnv ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedEnv ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>

            <pre className="p-3 bg-mono-950 text-mono-0 font-mono text-xs overflow-x-auto selection:bg-mono-700">
              {`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
VITE_GEMINI_API_KEY=AIzaSy...`}
            </pre>
            <p className="font-sans text-xs text-mono-500">
              SQL migrations are located in <code className="font-mono text-mono-900">supabase/migrations/20261117000000_inventory_schema.sql</code>.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Google Gemini AI API Configuration */}
      <Card
        title="Google Gemini AI Integration"
        subtitle="Manage generative model keys and inventory intelligence sensitivity"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-mono-50 border border-mono-200">
            <div className="p-2 bg-mono-950 text-mono-0 mt-0.5">
              <Key size={16} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-sans font-bold text-xs text-mono-950 uppercase tracking-tight">
                  Client-side Gemini API Key Override (Optional)
                </p>
                <p className="font-sans text-xs text-mono-600 mt-0.5">
                  If set, queries are routed directly through Gemini 1.5 Flash. When unconfigured, the application falls back to our deterministic mathematical intelligence engine.
                </p>
              </div>

              <div className="flex items-center gap-2 max-w-lg">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  className="flex-1 bg-mono-0 border border-mono-300 font-mono text-xs px-3 py-2 focus:outline-none focus:border-mono-950"
                />
                <Button size="sm" onClick={handleSaveGeminiKey}>
                  {keySaved ? 'Saved!' : 'Save Key'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. General Workspace Preferences */}
      <Card
        title="Workspace Configuration"
        subtitle="Business identity, currency units, and replenishment baselines"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Entity Name"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />

            <Input
              label="Currency Symbol"
              value={currencySymbol}
              onChange={e => setCurrencySymbol(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Low Stock Threshold"
              type="number"
              value={defaultThreshold}
              onChange={e => setDefaultThreshold(e.target.value)}
              helperText="Baseline reorder trigger for new catalog items"
            />

            <Select
              label="AI Restocking Sensitivity"
              value={sensitivity}
              onChange={e => setSensitivity(e.target.value as any)}
            >
              <option value="conservative">Conservative (Lean Inventory / Minimise Holding Cost)</option>
              <option value="standard">Standard (Balanced Safety Buffer)</option>
              <option value="aggressive">Aggressive (High Availability / Buffer Against Stockouts)</option>
            </Select>
          </div>

          <div className="flex justify-end pt-3 border-t border-mono-200">
            <Button type="submit">Update Preferences</Button>
          </div>
        </form>
      </Card>

      {/* 4. Danger Zone / Reset Demo Data */}
      <Card
        title="Workspace Reset"
        subtitle="Restore baseline demo data or clear local records"
        className="border-mono-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-sans font-bold text-xs text-mono-950">
              Reset to Clean Industrial Demo Data
            </p>
            <p className="font-sans text-xs text-mono-600 mt-0.5">
              Restores products, suppliers, and movement transactions back to the standard evaluation baseline.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            icon={<RotateCcw size={13} />}
            onClick={() => {
              if (window.confirm('Reset all catalog and transaction records back to demo dataset?')) {
                resetDemoData();
              }
            }}
          >
            Reset Workspace
          </Button>
        </div>
      </Card>
    </div>
  );
};
