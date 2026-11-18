import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Terminal,
  Maximize2,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  // Live ticking UTC clock
  const [timeString, setTimeString] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(318);
  const [radarDegree, setRadarDegree] = useState(42);

  // Runtime Field-Swap Viewport Mode
  const [viewportMode, setViewportMode] = useState<'compact' | 'detailed' | 'analytics'>('detailed');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(() => {
      updateTime();
      setElapsedSeconds(s => s + 1);
      setRadarDegree(d => (d + 1) % 360);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-ground text-ink font-sans selection:bg-ink selection:text-white">
      {/* 1. TOP PINNED METADATA STRIP */}
      <div className="bg-ink text-white/70 font-mono text-[10px] tracking-wider py-1.5 px-4 hairline-b border-white/10 flex items-center justify-between overflow-x-auto whitespace-nowrap select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
            BUILD 2.4.1
          </span>
          <span className="text-white/40">·</span>
          <span>DEPLOY: OPTIMAL</span>
          <span className="text-white/40">·</span>
          <span>CLUSTER: NYC-01</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UPTIME: 99.9% / {formatElapsed(elapsedSeconds)}</span>
          <span className="text-white/40">·</span>
          <span className="font-semibold text-white">{timeString || '12:00:00 UTC'}</span>
        </div>
      </div>

      {/* 2. FIXED HEADER / NAV (64px) */}
      <header className="sticky top-0 z-50 h-16 bg-ground/85 backdrop-blur-md hairline-b flex items-center justify-between px-6 select-none">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="font-display font-black text-2xl tracking-tighter uppercase text-ink">
              INVENT
            </span>
            <span className="w-2 h-2 rounded-full bg-signal" />
          </div>

          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-ink-muted">
            <a href="#overview" className="hover:text-ink hover:underline decoration-signal decoration-2 underline-offset-8 transition-colors">
              Overview
            </a>
            <a href="#proof" className="hover:text-ink hover:underline decoration-signal decoration-2 underline-offset-8 transition-colors">
              Proof
            </a>
            <a href="#architecture" className="hover:text-ink hover:underline decoration-signal decoration-2 underline-offset-8 transition-colors">
              Architecture
            </a>
            <a href="#stage" className="hover:text-ink hover:underline decoration-signal decoration-2 underline-offset-8 transition-colors">
              Mechanism
            </a>
            <a href="#specs" className="hover:text-ink hover:underline decoration-signal decoration-2 underline-offset-8 transition-colors">
              Specifications
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchApp}
            className="px-5 py-2 rounded-full bg-ink text-white font-mono text-xs uppercase tracking-wider hover:bg-signal transition-colors flex items-center gap-2 group shadow-sm"
          >
            <span>Launch App</span>
            <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section id="overview" className="relative bg-stage hairline-b overflow-hidden py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Specs */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ground hairline-all text-ink font-mono text-xs tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
              <span>Real-Time Stock Control</span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tighter uppercase leading-[0.9] text-ink">
              KNOW WHAT&apos;S IN STOCK.
            </h1>

            <p className="font-sans text-base sm:text-lg text-ink-secondary leading-relaxed max-w-xl">
              Deterministic multi-echelon stock control. Zero phantom inventory. Single-ledger atomic precision with sub-60ms throughput across regional distribution nodes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchApp}
                className="px-7 py-3.5 rounded-full bg-ink text-white font-mono text-xs uppercase tracking-wider hover:bg-signal transition-colors flex items-center gap-2 group"
              >
                <span>Launch Workspace</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#specs"
                className="px-7 py-3.5 rounded-full bg-ground hairline-all text-ink font-mono text-xs uppercase tracking-wider hover:bg-ink hover:text-white transition-colors"
              >
                Technical Specs
              </a>
            </div>

            {/* Spec Metric Strip */}
            <div className="pt-8 grid grid-cols-3 gap-6 hairline-t">
              <div>
                <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">SKU Volume</p>
                <p className="font-display font-black text-2xl text-ink mt-0.5">500K+</p>
              </div>
              <div className="hairline-l pl-6">
                <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">Ledger Latency</p>
                <p className="font-display font-black text-2xl text-ink mt-0.5">&lt;60MS</p>
              </div>
              <div className="hairline-l pl-6">
                <p className="font-mono text-[10px] text-ink-muted uppercase tracking-wider">Audit Accuracy</p>
                <p className="font-display font-black text-2xl text-ink mt-0.5 flex items-center gap-1">
                  <span>99.8%</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-signal inline-block" />
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Poster Occlusion Weave & Technical Mechanism */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[360px] sm:min-h-[460px]">
            {/* Background Layer: Massive Poster Wordmark (Z-index 1) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <span className="font-display font-black text-8xl sm:text-9xl tracking-tighter text-[#D5D5D8] opacity-60">
                INVENT
              </span>
            </div>

            {/* Middle Layer: Interactive Technical Radar Mechanism (Z-index 2) */}
            <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-ground hairline-all shadow-xl p-4 flex items-center justify-center">
              {/* Concentric rings */}
              <div className="absolute inset-4 rounded-full border border-dashed border-ink/20 animate-radar hover-pause" />
              <div className="absolute inset-10 rounded-full hairline-all" />
              <div className="absolute inset-20 rounded-full border border-dotted border-signal/40" />

              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-ink/15" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-full w-px bg-ink/15" />
              </div>

              {/* Rotating Signal Scanner Arm */}
              <div
                className="absolute w-1/2 h-0.5 bg-gradient-to-r from-transparent to-signal top-1/2 left-1/2 origin-left"
                style={{ transform: `rotate(${radarDegree}deg)` }}
              />

              {/* Center Core Node */}
              <div className="relative z-20 w-16 h-16 bg-ink text-white rounded-full flex flex-col items-center justify-center shadow-md">
                <span className="font-mono text-[9px] uppercase tracking-wider text-signal-lift font-bold">NODE</span>
                <span className="font-display font-black text-xs">US-01</span>
              </div>

              {/* Floating Signal Badges */}
              <div className="absolute -top-3 left-6 px-2 py-0.5 bg-ink text-white font-mono text-[9px] uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
                <span>SYNC: LIVE</span>
              </div>

              <div className="absolute -bottom-2 right-4 px-2 py-0.5 bg-ground hairline-all font-mono text-[9px] uppercase text-ink-secondary">
                AZ: {radarDegree}° · 40.71° N
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INVERTED PROOF SECTION (DEEP INK #0D0D0F) */}
      <section id="proof" className="bg-ink text-white py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 dark-hairline-b pb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-signal-lift font-bold">
                Verification Proof &bull; Statistical Convergence
              </p>
              <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tighter uppercase mt-2 text-white">
                THE MATHEMATICS OF CERTAINTY.
              </h2>
            </div>
            <p className="font-sans text-sm text-white/60 max-w-md leading-relaxed">
              Real-time audit comparisons against manual cycle counting. Verified through dual-ledger cryptographic balance states.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Big Stat Callout */}
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-white/50">
                Cycle Count Convergence
              </span>
              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-7xl sm:text-9xl tracking-tighter text-white">
                  99.8
                </span>
                <span className="font-display font-bold text-4xl text-signal-lift">%</span>
              </div>
              <p className="font-mono text-xs text-white/60 uppercase tracking-wider leading-relaxed">
                Observed error drift is compressed to 0.002% across 84,000+ daily pick-and-pack transitions.
              </p>
            </div>

            {/* Animated SVG Dual Line-Trace Chart */}
            <div className="lg:col-span-7 bg-white/5 dark-hairline-all p-6 relative">
              <div className="flex items-center justify-between pb-4 dark-hairline-b text-xs font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-0.5 bg-signal inline-block" />
                    INVENT DETERMINISTIC TRACE
                  </span>
                  <span className="flex items-center gap-1.5 text-white/40">
                    <span className="w-2 h-0.5 bg-white/30 inline-block" />
                    LEGACY DRIFT
                  </span>
                </div>
                <span className="text-signal-lift font-bold">DELTA: -94.2%</span>
              </div>

              {/* Chart Visual */}
              <div className="h-56 w-full pt-4 relative">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

                  {/* Legacy Drift Line (Erratic, Dotted Gray) */}
                  <path
                    d="M 0 160 Q 60 120, 120 170 T 240 100 T 360 150 T 500 110"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />

                  {/* INVENT Line (Stable, Precision Signal Blue) */}
                  <path
                    d="M 0 65 L 80 60 L 160 55 L 240 50 L 320 48 L 400 46 L 500 45"
                    fill="none"
                    stroke="#2F5BFF"
                    strokeWidth="3.5"
                    className="animate-trace"
                  />

                  {/* Glowing Signal Nodes */}
                  <circle cx="240" cy="50" r="5" fill="#2F5BFF" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="500" cy="45" r="5" fill="#2F5BFF" stroke="#FFFFFF" strokeWidth="2" />
                </svg>

                <div className="flex justify-between font-mono text-[10px] text-white/40 pt-2 uppercase">
                  <span>Day 01 (Initial Intake)</span>
                  <span>Day 15 (Mid-Cycle Rebalance)</span>
                  <span>Day 30 (Audit Closeout)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TECHNICAL ARCHITECTURE & CONSTRUCTION DIAGRAM */}
      <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wider text-signal font-bold">
            03 // TECHNICAL BLUEPRINT
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter uppercase text-ink">
            ENGINEERED WITHOUT HEURISTICS.
          </h2>
          <p className="font-sans text-sm text-ink-secondary max-w-xl">
            Direct PostgreSQL ledger primitives combined with atomic row locking guarantee zero inventory collision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Hairline Definition List (Left 5 Cols) */}
          <div className="lg:col-span-5 divide-y divide-hairline hairline-y">
            <div className="py-4 space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-signal font-bold">01 / ROW-LEVEL ATOMIC LOCK</span>
                <span className="text-ink-muted">PL/pgSQL</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Applies exclusive <code>SELECT ... FOR UPDATE</code> locks prior to computing balance shifts, preventing race conditions under high concurrency.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-signal font-bold">02 / IMMUTABLE TRANSACTION LEDGER</span>
                <span className="text-ink-muted">APPEND ONLY</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Every physical unit displacement is persisted as an immutable audit row with previous balance, new balance, and operator attribution.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-signal font-bold">03 / CONTEXT-INJECTED AI SPECIALIST</span>
                <span className="text-ink-muted">GEMINI 1.5</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Google Gemini operates strictly on deterministic query context snapshots. Zero hallucinated inventory quantities or unbacked valuations.
              </p>
            </div>

            <div className="py-4 space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-signal font-bold">04 / ZERO-ACCENT MONOCHROME RIGOR</span>
                <span className="text-ink-muted">SWISS SPEC</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Strict visual hierarchy based on typography, hairline borders, and neutral value scale, devoid of distracting decorative glassmorphism.
              </p>
            </div>
          </div>

          {/* Construction Blueprint Schematic (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-stage hairline-all p-6 relative">
            <div className="flex items-center justify-between font-mono text-[10px] text-ink-muted uppercase pb-3 hairline-b">
              <span>SYSTEM_SCHEMATIC_V2.SVG</span>
              <span>SCALE 1:1 · ISOMETRIC</span>
            </div>

            <div className="py-6 flex items-center justify-center">
              <svg viewBox="0 0 460 220" className="w-full max-w-md overflow-visible">
                {/* Node Box 1: Storage Layer */}
                <rect x="20" y="40" width="100" height="60" fill="#EFEFEE" stroke="#0D0D0F" strokeWidth="1.5" />
                <text x="30" y="65" fontFamily="IBM Plex Mono" fontSize="9" fill="#0D0D0F" fontWeight="bold">POSTGRESQL</text>
                <text x="30" y="80" fontFamily="IBM Plex Mono" fontSize="8" fill="#6E6F76">LEDGER ENGINE</text>

                {/* Connecting Line 1 */}
                <line x1="120" y1="70" x2="180" y2="70" stroke="#0D0D0F" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="150" cy="70" r="3" fill="#2F5BFF" />

                {/* Node Box 2: Atomic RPC Controller */}
                <rect x="180" y="30" width="110" height="80" fill="#0D0D0F" stroke="#0D0D0F" strokeWidth="1.5" />
                <text x="195" y="60" fontFamily="IBM Plex Mono" fontSize="9" fill="#FFFFFF" fontWeight="bold">ATOMIC RPC</text>
                <text x="195" y="75" fontFamily="IBM Plex Mono" fontSize="8" fill="#7C97FF">FOR UPDATE</text>
                <text x="195" y="90" fontFamily="IBM Plex Mono" fontSize="8" fill="#B5B6BB">MUTATION SAFE</text>

                {/* Connecting Line 2 */}
                <line x1="290" y1="70" x2="340" y2="70" stroke="#0D0D0F" strokeWidth="1.5" />
                <polygon points="340,66 348,70 340,74" fill="#0D0D0F" />

                {/* Node Box 3: Real-Time Client Suite */}
                <rect x="348" y="40" width="100" height="60" fill="#EFEFEE" stroke="#0D0D0F" strokeWidth="1.5" />
                <text x="358" y="65" fontFamily="IBM Plex Mono" fontSize="9" fill="#0D0D0F" fontWeight="bold">REACT CLIENT</text>
                <text x="358" y="80" fontFamily="IBM Plex Mono" fontSize="8" fill="#6E6F76">SUB-60MS STATE</text>

                {/* Gemini AI Sidecar */}
                <line x1="235" y1="110" x2="235" y2="150" stroke="#2F5BFF" strokeWidth="1.5" />
                <rect x="175" y="150" width="120" height="50" fill="#EFEFEE" stroke="#2F5BFF" strokeWidth="1.5" />
                <text x="188" y="172" fontFamily="IBM Plex Mono" fontSize="9" fill="#0D0D0F" fontWeight="bold">GEMINI 1.5 PROXY</text>
                <text x="188" y="186" fontFamily="IBM Plex Mono" fontSize="8" fill="#2F5BFF">EDGE FUNCTION</text>
              </svg>
            </div>

            <div className="hairline-t pt-3 flex items-center justify-between font-mono text-[10px] text-ink-muted">
              <span>SECURITY: RLS POLICIES STRICT</span>
              <span className="text-signal font-semibold">ALL TEST GATES PASS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PINNED COUNTER-TRAVEL STAGE WITH MARQUEE */}
      <section id="stage" className="bg-ink text-white py-16 overflow-hidden">
        {/* Top Marquee */}
        <div className="flex whitespace-nowrap overflow-hidden select-none border-y border-white/10 py-3">
          <div className="flex gap-8 items-center font-display font-black text-3xl sm:text-5xl tracking-tighter uppercase text-white/90 animate-marquee hover-pause">
            <span>REAL-TIME MULTI-ECHELON CONTROL</span>
            <span className="text-signal">&bull;</span>
            <span>SUB-60MS TRANSACTION SPEED</span>
            <span className="text-signal">&bull;</span>
            <span>ZERO INVENTORY DRIFT</span>
            <span className="text-signal">&bull;</span>
            <span>DETERMINISTIC INTELLIGENCE</span>
            <span className="text-signal">&bull;</span>
          </div>
          <div className="flex gap-8 items-center font-display font-black text-3xl sm:text-5xl tracking-tighter uppercase text-white/90 animate-marquee hover-pause" aria-hidden="true">
            <span>REAL-TIME MULTI-ECHELON CONTROL</span>
            <span className="text-signal">&bull;</span>
            <span>SUB-60MS TRANSACTION SPEED</span>
            <span className="text-signal">&bull;</span>
            <span>ZERO INVENTORY DRIFT</span>
            <span className="text-signal">&bull;</span>
            <span>DETERMINISTIC INTELLIGENCE</span>
            <span className="text-signal">&bull;</span>
          </div>
        </div>

        {/* Counter Marquee (Reversed) */}
        <div className="flex whitespace-nowrap overflow-hidden select-none border-b border-white/10 py-3 bg-white/5">
          <div className="flex gap-8 items-center font-mono text-xs sm:text-sm tracking-widest uppercase text-white/50 animate-marqueeReverse hover-pause">
            <span>SUPABASE POSTGRESQL ENGINE</span>
            <span className="text-signal-lift">/</span>
            <span>ROW LEVEL SECURITY ACTIVE</span>
            <span className="text-signal-lift">/</span>
            <span>GOOGLE GEMINI 1.5 FLASH PROXY</span>
            <span className="text-signal-lift">/</span>
            <span>ATOMIC STOCK MUTATIONS</span>
            <span className="text-signal-lift">/</span>
          </div>
          <div className="flex gap-8 items-center font-mono text-xs sm:text-sm tracking-widest uppercase text-white/50 animate-marqueeReverse hover-pause" aria-hidden="true">
            <span>SUPABASE POSTGRESQL ENGINE</span>
            <span className="text-signal-lift">/</span>
            <span>ROW LEVEL SECURITY ACTIVE</span>
            <span className="text-signal-lift">/</span>
            <span>GOOGLE GEMINI 1.5 FLASH PROXY</span>
            <span className="text-signal-lift">/</span>
            <span>ATOMIC STOCK MUTATIONS</span>
            <span className="text-signal-lift">/</span>
          </div>
        </div>
      </section>

      {/* 7. RUNTIME FIELD-SWAP PICKER ("ADAPTIVE VIEWPORTS") */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hairline-b pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-signal font-bold">
              04 // ADAPTIVE VIEWPORT ENGINE
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tighter uppercase text-ink mt-1">
              FIELD-SWAP WORKSPACE DENSITIES.
            </h2>
          </div>

          {/* Density Toggles */}
          <div className="p-1 bg-stage hairline-all rounded-full flex items-center gap-1 font-mono text-xs uppercase">
            <button
              onClick={() => setViewportMode('compact')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                viewportMode === 'compact' ? 'bg-ink text-white font-bold' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setViewportMode('detailed')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                viewportMode === 'detailed' ? 'bg-ink text-white font-bold' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewportMode('analytics')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                viewportMode === 'analytics' ? 'bg-ink text-white font-bold' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Live Adaptive Container */}
        <div className="bg-ground hairline-all p-6 sm:p-8 transition-all duration-300">
          <div className="flex items-center justify-between font-mono text-xs text-ink-muted pb-4 hairline-b">
            <span>ACTIVE PROFILE: {viewportMode.toUpperCase()} VIEWPORT</span>
            <span className="text-signal font-bold">SAMPLE LIVE LEDGER</span>
          </div>

          {viewportMode === 'compact' && (
            <div className="py-6 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 bg-stage hairline-all">
                <span className="font-bold text-ink">MCU-M7-CORE</span>
                <span>8 UNITS</span>
                <span className="text-signal font-semibold">RP: 20</span>
                <span>$62.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stage hairline-all">
                <span className="font-bold text-ink">SEN-LIDAR-002</span>
                <span>4 UNITS</span>
                <span className="text-signal font-semibold">RP: 15</span>
                <span>$145.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stage hairline-all">
                <span className="font-bold text-ink">BOX-CRG-443</span>
                <span>142 UNITS</span>
                <span className="text-ink-muted">RP: 50</span>
                <span>$22.00</span>
              </div>
            </div>
          )}

          {viewportMode === 'detailed' && (
            <div className="py-6 overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="hairline-b text-ink-muted uppercase">
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Specification</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Balance</th>
                    <th className="py-2 px-3 text-right">Unit Value</th>
                    <th className="py-2 px-3">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr>
                    <td className="py-3 px-3 font-bold text-ink">SEN-LIDAR-002</td>
                    <td className="py-3 px-3 font-sans text-ink-secondary">Solid-State Optical Rangefinder</td>
                    <td className="py-3 px-3">Electronics</td>
                    <td className="py-3 px-3 text-right font-bold text-ink">4 / 15</td>
                    <td className="py-3 px-3 text-right">$145.00</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-stage hairline-all text-[10px] uppercase font-bold text-signal">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-ink">FAS-TI-M630</td>
                    <td className="py-3 px-3 font-sans text-ink-secondary">Aerospace Grade-5 Titanium Screw M6</td>
                    <td className="py-3 px-3">Hardware</td>
                    <td className="py-3 px-3 text-right font-bold text-ink">18 / 25</td>
                    <td className="py-3 px-3 text-right">$38.50</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-stage hairline-all text-[10px] uppercase font-bold text-signal">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-ink">BOX-CRG-443</td>
                    <td className="py-3 px-3 font-sans text-ink-secondary">Reinforced Transit Corrugated Carton</td>
                    <td className="py-3 px-3">Packaging</td>
                    <td className="py-3 px-3 text-right font-bold text-ink">142 / 50</td>
                    <td className="py-3 px-3 text-right">$22.00</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-ink text-white text-[10px] uppercase font-bold">
                        Optimal
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {viewportMode === 'analytics' && (
            <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-stage hairline-all space-y-2">
                <p className="font-mono text-[10px] uppercase text-ink-muted">Asset Velocity</p>
                <p className="font-display font-black text-2xl text-ink">84,203 Units</p>
                <div className="w-full bg-ground h-1.5 overflow-hidden">
                  <div className="bg-signal h-full w-4/5" />
                </div>
                <p className="font-mono text-[10px] text-ink-secondary">+12.4% vs 30D baseline</p>
              </div>

              <div className="p-4 bg-stage hairline-all space-y-2">
                <p className="font-mono text-[10px] uppercase text-ink-muted">Holding Cost Valuation</p>
                <p className="font-display font-black text-2xl text-ink">$8,304.30</p>
                <div className="w-full bg-ground h-1.5 overflow-hidden">
                  <div className="bg-ink h-full w-3/5" />
                </div>
                <p className="font-mono text-[10px] text-ink-secondary">8 Active SKUs Tracked</p>
              </div>

              <div className="p-4 bg-stage hairline-all space-y-2">
                <p className="font-mono text-[10px] uppercase text-ink-muted">Replenishment Capital</p>
                <p className="font-display font-black text-2xl text-signal">$19,101.00</p>
                <div className="w-full bg-ground h-1.5 overflow-hidden">
                  <div className="bg-signal h-full w-2/5" />
                </div>
                <p className="font-mono text-[10px] text-ink-secondary">4 Critical Lines Requiring PO</p>
              </div>
            </div>
          )}

          <div className="pt-4 hairline-t flex items-center justify-between">
            <span className="font-mono text-xs text-ink-secondary">
              Experience the full 8-screen live operational workspace.
            </span>
            <button
              onClick={onLaunchApp}
              className="px-4 py-2 rounded-full bg-ink text-white font-mono text-xs uppercase tracking-wider hover:bg-signal transition-colors flex items-center gap-1.5"
            >
              <span>Launch Suite</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. TECHNICAL SPECIFICATIONS SECTION */}
      <section id="specs" className="py-20 px-6 bg-stage hairline-t">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-signal font-bold">
              05 // SYSTEM SPECIFICATION LIST
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tighter uppercase text-ink mt-1">
              HARDWARE &amp; PROTOCOL SPECS.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-ground p-5 hairline-all space-y-3">
              <div className="flex items-center justify-between font-mono text-xs hairline-b pb-2">
                <span className="font-bold text-ink">DATABASE CONCURRENCY</span>
                <span className="text-signal">POSTGRESQL 15+</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Atomic stored procedures with table locks ensure sequential mutation guarantee. Handles concurrent warehouse scan guns without deadlocks.
              </p>
            </div>

            <div className="bg-ground p-5 hairline-all space-y-3">
              <div className="flex items-center justify-between font-mono text-xs hairline-b pb-2">
                <span className="font-bold text-ink">SECURITY ARCHITECTURE</span>
                <span className="text-signal">RLS + JWT</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Row-Level Security isolates tenant spaces. Protected application routes and encrypted service-role tokens for Edge Function invocation.
              </p>
            </div>

            <div className="bg-ground p-5 hairline-all space-y-3">
              <div className="flex items-center justify-between font-mono text-xs hairline-b pb-2">
                <span className="font-bold text-ink">AI COGNITION ENGINE</span>
                <span className="text-signal">GEMINI 1.5 FLASH</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Context-injected inference proxy with strict zero-hallucination prompt envelope. Computes replenishment deficits deterministically.
              </p>
            </div>

            <div className="bg-ground p-5 hairline-all space-y-3">
              <div className="flex items-center justify-between font-mono text-xs hairline-b pb-2">
                <span className="font-bold text-ink">DATA EXPORT &amp; COMPLIANCE</span>
                <span className="text-signal">RFC-4180 CSV</span>
              </div>
              <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                Instant streaming CSV export across all 6 report modules: Valuation, Movement Velocity, Deadstock, and Replenishment deficit lists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TECHNICAL FOOTER */}
      <footer className="bg-ink text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 dark-hairline-b pb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-2xl tracking-tighter uppercase text-white">
                  INVENT
                </span>
                <span className="w-2 h-2 rounded-full bg-signal" />
              </div>
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                Technical inventory control platform designed for precision manufacturing, hardware labs, and regional logistics nodes.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs uppercase">
              <p className="font-bold text-signal-lift tracking-wider">Navigation</p>
              <ul className="space-y-1 text-white/60">
                <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
                <li><a href="#proof" className="hover:text-white transition-colors">Proof &amp; Metrics</a></li>
                <li><a href="#architecture" className="hover:text-white transition-colors">Architecture</a></li>
                <li><a href="#specs" className="hover:text-white transition-colors">Specifications</a></li>
              </ul>
            </div>

            <div className="space-y-2 font-mono text-xs uppercase">
              <p className="font-bold text-signal-lift tracking-wider">System Infrastructure</p>
              <ul className="space-y-1 text-white/60">
                <li>Supabase PostgreSQL</li>
                <li>Google Gemini API</li>
                <li>Vercel Edge Network</li>
                <li>Tailwind CSS Monochromatic</li>
              </ul>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p className="font-bold text-signal-lift uppercase tracking-wider">Direct Access</p>
              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 rounded-full bg-white text-ink font-bold uppercase tracking-wider hover:bg-signal hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <span>Launch Workspace</span>
                <ArrowRight size={13} />
              </button>
              <p className="text-[10px] text-white/40 uppercase">
                NODE COORDINATES: 40.7128° N, 74.0060° W
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-white/40 uppercase">
            <span>&copy; {new Date().getFullYear()} INVENT TECHNICAL SYSTEMS INC. ALL RIGHTS RESERVED.</span>
            <div className="flex items-center gap-2 text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-signal inline-block" />
              <span>CLUSTER STATUS: NORMAL OPERATING ENVELOPE</span>
            </div>
          </div>
        </div>

        {/* Massive Cropped Bottom-Bleeding INVENT Wordmark */}
        <div className="absolute -bottom-10 left-0 right-0 pointer-events-none select-none overflow-hidden opacity-10 flex justify-center">
          <span className="font-display font-black text-[18vw] tracking-tighter leading-none text-white whitespace-nowrap">
            I N V E N T
          </span>
        </div>
      </footer>
    </div>
  );
};
