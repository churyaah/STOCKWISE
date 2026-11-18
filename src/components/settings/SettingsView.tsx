import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import {
  isSupabaseConfigured,
  getSupabaseCredentials,
  createCustomSupabaseClient,
} from '../../services/supabase';
import {
  Database,
  Sparkles,
  RotateCcw,
  Key,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData, refreshData } = useData();
  const { profile } = useAuth();

  const [businessName, setBusinessName] = useState(settings.business_name || 'StockWise Telemetry Node');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '₹');
  const [defaultThreshold, setDefaultThreshold] = useState(String(settings.low_stock_threshold_default || 10));
  const [sensitivity, setSensitivity] = useState(settings.ai_restock_sensitivity || 'standard');

  // Supabase Credentials State
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.key);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  // Gemini Key Override
  const [geminiKey, setGeminiKey] = useState(
    localStorage.getItem('inv_mgr_gemini_key') || ''
  );
  const [keySaved, setKeySaved] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);

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

  const handleTestAndSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setSupabaseTestStatus({
        tested: true,
        success: false,
        message: 'Please provide both Supabase Project URL and Anon Public Key.',
      });
      return;
    }

    try {
      setTestingSupabase(true);
      const testClient = createCustomSupabaseClient(supabaseUrl.trim(), supabaseKey.trim());
      
      // Ping database by querying products or categories
      const { data, error } = await testClient.from('products').select('count', { count: 'exact', head: true });
      
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet or auth issue
        setSupabaseTestStatus({
          tested: true,
          success: false,
          message: `Connection reached Supabase, but encountered table query notice: ${error.message}. Ensure migrations are run in the SQL editor.`,
        });
      } else {
        // Save to browser storage
        localStorage.setItem('stockwise_supabase_url', supabaseUrl.trim());
        localStorage.setItem('stockwise_supabase_key', supabaseKey.trim());
        
        setSupabaseTestStatus({
          tested: true,
          success: true,
          message: 'Successfully verified connection to Supabase PostgreSQL cloud database! Credentials saved.',
        });

        // Trigger data refresh
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err: any) {
      setSupabaseTestStatus({
        tested: true,
        success: false,
        message: `Connection failed: ${err.message || 'Network error'}`,
      });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleClearSupabase = () => {
    localStorage.removeItem('stockwise_supabase_url');
    localStorage.removeItem('stockwise_supabase_key');
    setSupabaseUrl('');
    setSupabaseKey('');
    setSupabaseTestStatus({
      tested: true,
      success: false,
      message: 'Supabase credentials cleared. System switched to persistent local storage engine.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
    const text = `VITE_SUPABASE_URL=${supabaseUrl || 'https://your-project.supabase.co'}\nVITE_SUPABASE_ANON_KEY=${supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}\nVITE_GEMINI_API_KEY=${geminiKey || 'AIzaSy...'}`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const copyMigrationSQL = () => {
    const sqlNotice = `-- SQL migration file: supabase/migrations/20261117000000_inventory_schema.sql\n-- Copy this file's full content from your workspace repository into Supabase SQL Editor.`;
    navigator.clipboard.writeText(sqlNotice);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl font-mono text-[#0D0D0F]">
      {/* 1. Database & Cloud Architecture Status */}
      <Card
        title="DATABASE &amp; BACKEND INFRASTRUCTURE"
        subtitle="Supabase PostgreSQL schema, Row-Level Security & atomic transaction engine"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#F8F8FA] border border-[#D7D8DD] gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 ${supabaseActive ? 'bg-[#00C853] text-white' : 'bg-[#0D0D0F] text-white'}`}>
                <Database size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-[#0D0D0F] uppercase tracking-wider">
                  {supabaseActive ? 'Supabase PostgreSQL (Cloud Connected)' : 'Persistent Local Storage Engine (Active Fallback)'}
                </p>
                <p className="text-xs text-[#6E6F76] mt-0.5">
                  {supabaseActive
                    ? 'Connected to live Supabase cluster with Row Level Security & atomic RPC transactions.'
                    : 'Running deterministic offline-first storage engine with identical schema, transactions & validation.'}
                </p>
              </div>
            </div>

            <span
              className={`text-xs px-2.5 py-1 uppercase border font-bold whitespace-nowrap ${
                supabaseActive
                  ? 'bg-[#E8F8EE] text-[#008736] border-[#A6E8BA]'
                  : 'bg-[#F2F2F4] text-[#4E5058] border-[#D7D8DD]'
              }`}
            >
              {supabaseActive ? 'LIVE CLOUD' : 'LOCAL FALLBACK'}
            </span>
          </div>

          {/* Interactive Live Supabase Connector */}
          <div className="p-4 border border-[#D7D8DD] bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAEBED] pb-2">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D0D0F]">
                  Supabase Live Cluster Connection
                </h4>
                <p className="text-[11px] text-[#6E6F76]">
                  Enter your Supabase project credentials to connect directly from this browser
                </p>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-[#2F5BFF] hover:underline font-bold"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-bold text-[#4E5058] mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full bg-[#F8F8FA] border border-[#D7D8DD] px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0D0D0F]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-[#4E5058] mb-1">
                  Supabase Public Anon Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  className="w-full bg-[#F8F8FA] border border-[#D7D8DD] px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0D0D0F]"
                />
              </div>

              {/* Status Message */}
              {supabaseTestStatus.tested && (
                <div
                  className={`p-3 border text-xs font-mono flex items-start gap-2 ${
                    supabaseTestStatus.success
                      ? 'bg-[#E8F8EE] border-[#A6E8BA] text-[#008736]'
                      : 'bg-[#FFF3F0] border-[#FFCCBC] text-[#C52B00]'
                  }`}
                >
                  {supabaseTestStatus.success ? (
                    <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                  )}
                  <span>{supabaseTestStatus.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClearSupabase}
                  className="text-xs text-[#8E909A] hover:text-[#0D0D0F] underline"
                >
                  Clear credentials &amp; use local engine
                </button>

                <Button
                  onClick={handleTestAndSaveSupabase}
                  disabled={testingSupabase}
                  icon={testingSupabase ? <RefreshCw size={13} className="animate-spin" /> : <Server size={13} />}
                >
                  {testingSupabase ? 'Testing Connection...' : 'Save & Connect to Supabase'}
                </Button>
              </div>
            </div>
          </div>

          {/* Environment Variables & Migration Reference */}
          <div className="p-4 border border-[#D7D8DD] bg-[#F8F8FA] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#0D0D0F]">
                Deployment Environment Variables (.env / Vercel)
              </span>
              <button
                onClick={copyEnvSample}
                className="text-xs flex items-center gap-1.5 text-[#6E6F76] hover:text-[#0D0D0F]"
              >
                {copiedEnv ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedEnv ? 'Copied' : 'Copy Variables'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#0D0D0F] text-white font-mono text-xs overflow-x-auto selection:bg-[#2F5BFF]">
{`VITE_SUPABASE_URL=${supabaseUrl || 'https://your-project.supabase.co'}
VITE_SUPABASE_ANON_KEY=${supabaseKey ? supabaseKey.slice(0, 20) + '...' : 'your-anon-key'}
VITE_GEMINI_API_KEY=${geminiKey ? geminiKey.slice(0, 10) + '...' : 'your-gemini-key'}`}
            </pre>
            
            <div className="text-[11px] text-[#6E6F76] space-y-1">
              <p>
                <strong>SQL Migration Path:</strong>{' '}
                <code className="text-[#0D0D0F] bg-white px-1 border border-[#D7D8DD]">
                  supabase/migrations/20261117000000_inventory_schema.sql
                </code>
              </p>
              <p>
                Run this migration inside your Supabase project's <strong>SQL Editor</strong> to create tables, indexes, RLS policies, and the atomic stored procedure.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Google Gemini AI API Configuration */}
      <Card
        title="GOOGLE GEMINI AI INTEGRATION"
        subtitle="Manage generative model keys and inventory intelligence sensitivity"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-[#F8F8FA] border border-[#D7D8DD]">
            <div className="p-2 bg-[#0D0D0F] text-white mt-0.5">
              <Key size={16} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-bold text-xs text-[#0D0D0F] uppercase tracking-wider">
                  Client-side Gemini API Key Override (Optional)
                </p>
                <p className="text-xs text-[#6E6F76] mt-0.5">
                  When set, conversational questions and drift telemetry are analyzed with Google Gemini 1.5. If unset, deterministic mathematical algorithms calculate rebalancing advice.
                </p>
              </div>

              <div className="flex items-center gap-2 max-w-lg">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  className="flex-1 bg-white border border-[#D7D8DD] font-mono text-xs px-3 py-2 focus:outline-none focus:border-[#0D0D0F]"
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
        title="WORKSPACE CONFIGURATION &amp; TELEMETRY"
        subtitle="Business identity, currency units, regional node, and replenishment baselines"
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
              helperText="Default set to ₹ (Indian Rupee)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Default Low Stock Threshold"
              type="number"
              value={defaultThreshold}
              onChange={e => setDefaultThreshold(e.target.value)}
              helperText="Reorder safety line for SKUs"
            />

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#4E5058]">
                Cluster Region
              </label>
              <div className="p-2 bg-[#F8F8FA] border border-[#D7D8DD] font-mono text-xs text-[#0D0D0F]">
                AP-SOUTH-1 (Mumbai / India)
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase font-bold text-[#4E5058]">
                Node ID
              </label>
              <div className="p-2 bg-[#F8F8FA] border border-[#D7D8DD] font-mono text-xs text-[#0D0D0F]">
                IN-BLR-01 (Bangalore Hub)
              </div>
            </div>
          </div>

          <Select
            label="AI Restocking Sensitivity"
            value={sensitivity}
            onChange={e => setSensitivity(e.target.value as any)}
          >
            <option value="conservative">Conservative (Lean Inventory / Minimise Capital Lockup)</option>
            <option value="standard">Standard (Balanced Safety Buffer &amp; Stockout Prevention)</option>
            <option value="aggressive">Aggressive (High Availability / 99.8% Service Level)</option>
          </Select>

          <div className="flex justify-end pt-3 border-t border-[#D7D8DD]">
            <Button type="submit">Update Preferences</Button>
          </div>
        </form>
      </Card>

      {/* 4. Danger Zone / Reset Demo Data */}
      <Card
        title="WORKSPACE DATA EVALUATION RESET"
        subtitle="Restore baseline demo data or clear local records"
        className="border-[#D7D8DD]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-xs text-[#0D0D0F] uppercase tracking-wider">
              Reset to Clean StockWise Telemetry Data
            </p>
            <p className="text-xs text-[#6E6F76] mt-0.5">
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
