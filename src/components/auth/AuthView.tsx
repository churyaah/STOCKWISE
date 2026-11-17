import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EchoText } from '../common/EchoText';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { signIn, signUp, resetPassword, signInDemoAdmin } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('admin@inventory.local');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Alexander Sterling');
  const [businessName, setBusinessName] = useState('Sterling Precision Systems');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        await signIn(email, password);
      } else if (mode === 'SIGNUP') {
        await signUp(email, password, fullName, businessName);
        setSuccessMessage('Account created successfully. You are now logged in.');
      } else if (mode === 'FORGOT') {
        await resetPassword(email);
        setSuccessMessage('Password reset instruction sent to provided email address.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mono-100 flex flex-col justify-between p-6 selection:bg-mono-950 selection:text-mono-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-mono-950 flex items-center justify-center text-mono-0 font-display font-black text-sm">
            IM
          </div>
          <span className="font-display font-black text-sm uppercase tracking-tight text-mono-950">
            Inventory Manager
          </span>
        </div>

        <button
          onClick={signInDemoAdmin}
          className="font-mono text-xs uppercase px-3 py-1.5 bg-mono-0 border border-mono-900 text-mono-950 hover:bg-mono-950 hover:text-mono-0 transition-colors"
        >
          Instant Demo Access &rarr;
        </button>
      </div>

      {/* Center Section: Swiss Brutalist Typographic Stack & Form */}
      <div className="max-w-md w-full mx-auto my-12 bg-mono-0 border border-mono-900 shadow-2xl p-8 space-y-6 animate-in zoom-in-95">
        <div className="text-center space-y-2">
          {/* Typographic Echo Effect */}
          <div className="py-2">
            <EchoText text="INVENTORY" as="h1" className="text-3xl tracking-tighter" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-mono-500">
            Monochromatic SaaS &bull; Architecture v2.0
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border border-mono-300 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError(null);
            }}
            className={`py-2 text-center uppercase transition-colors ${
              mode === 'LOGIN'
                ? 'bg-mono-950 text-mono-0 font-bold'
                : 'bg-mono-50 text-mono-600 hover:bg-mono-150'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('SIGNUP');
              setError(null);
            }}
            className={`py-2 text-center uppercase transition-colors ${
              mode === 'SIGNUP'
                ? 'bg-mono-950 text-mono-0 font-bold'
                : 'bg-mono-50 text-mono-600 hover:bg-mono-150'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3 bg-mono-100 border border-mono-950 font-mono text-xs text-mono-950 font-bold">
            [!] {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-mono-50 border border-mono-900 font-mono text-xs text-mono-950 font-bold flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'SIGNUP' && (
            <>
              <Input
                label="Full Name"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Marcus Vance"
              />
              <Input
                label="Business Entity Name"
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Vance Precision Logistics"
              />
            </>
          )}

          <Input
            label="Email Address"
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@inventory.local"
          />

          {mode !== 'FORGOT' && (
            <Input
              label="Password"
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          )}

          {mode === 'LOGIN' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('FORGOT')}
                className="font-mono text-[11px] text-mono-500 hover:text-mono-950 underline uppercase"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {mode === 'FORGOT' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="font-mono text-[11px] text-mono-500 hover:text-mono-950 underline uppercase"
              >
                Back to Sign In
              </button>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Authenticating...' : mode === 'LOGIN' ? 'Sign In to Workspace' : mode === 'SIGNUP' ? 'Create Administrator Account' : 'Send Reset Link'}
          </Button>

          {/* Quick Demo Access Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={signInDemoAdmin}
              className="font-mono text-xs text-mono-600 hover:text-mono-950 underline uppercase flex items-center justify-center gap-1.5 mx-auto"
            >
              <span>Explore Demo Workspace Directly</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-[11px] text-mono-500 uppercase tracking-widest max-w-7xl w-full mx-auto">
        <span>STRICT MONOCHROMATIC DESIGN SYSTEM &bull; GEIST / CLASH / SATOSHI &bull; SUPABASE &amp; GEMINI</span>
      </div>
    </div>
  );
};
