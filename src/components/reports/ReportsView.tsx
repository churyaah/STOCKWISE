import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportCsv';
import {
  Calendar,
  Network,
  Download,
  RotateCw,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { products, transactions, stats, refreshData, loading } = useData();
  const [selectedRange, setSelectedRange] = useState<'90D' | '30D' | '7D'>('90D');
  const [selectedModel, setSelectedModel] = useState<'MONTE_CARLO' | 'DETERMINISTIC' | 'ARIMA'>('MONTE_CARLO');
  const [rebalancingActive, setRebalancingActive] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'VALUATION_AUDIT' | 'TRANSACTIONS_LEDGER'>('TELEMETRY');

  // Realistic deterministic trajectory dataset aligned with the screenshot
  const trajectoryData = useMemo(() => {
    return [
      { interval: 'T+0', day: 'DAY 0', baseline: 1250, actual: 1220, upper: 1350, lower: 1100 },
      { interval: 'T+50', day: 'DAY 5', baseline: 1310, actual: 1340, upper: 1420, lower: 1180 },
      { interval: 'T+100', day: 'DAY 10', baseline: 1380, actual: 1360, upper: 1510, lower: 1240 },
      { interval: 'T+150', day: 'DAY 15', baseline: 1440, actual: 1438, upper: 1590, lower: 1290, marker: 'T-009: 1,438 M' },
      { interval: 'T+200', day: 'DAY 20', baseline: 1490, actual: 1410, upper: 1650, lower: 1330 },
      { interval: 'T+250', day: 'DAY 25', baseline: 1530, actual: 1480, upper: 1710, lower: 1370 },
      { interval: 'T+300', day: 'DAY 30', baseline: 1560, actual: 1520, upper: 1760, lower: 1400 },
      { interval: 'T+350', day: 'DAY 35', baseline: 1580, actual: 1490, upper: 1790, lower: 1410 },
      { interval: 'T+400', day: 'DAY 40', baseline: 1590, actual: 1430, upper: 1810, lower: 1390 },
      { interval: 'T+450', day: 'DAY 45', baseline: 1570, actual: 1340, upper: 1810, lower: 1350 },
      { interval: 'T+500', day: 'DAY 50', baseline: 1520, actual: 1260, upper: 1780, lower: 1280 },
      { interval: 'T+550', day: 'DAY 55', baseline: 1450, actual: 1190, upper: 1720, lower: 1210 },
      { interval: 'T+600', day: 'DAY 60', baseline: 1370, actual: 1120, upper: 1650, lower: 1150 },
    ];
  }, []);

  // Velocity flow matrix intervals
  const flowMatrix = [
    { id: 'INT-01 [T - 22D]', inQty: 420, outQty: 310, net: 110, isPositive: true },
    { id: 'INT-04 [T - 18D]', inQty: 680, outQty: 540, net: 140, isPositive: true },
    { id: 'INT-05 [T - 14D]', inQty: 810, outQty: 920, net: -110, isPositive: false },
    { id: 'INT-08 [T - 09D]', inQty: 940, outQty: 620, net: 320, isPositive: true },
    { id: 'INT-10 [T - 04D]', inQty: 1240, outQty: 780, net: 460, isPositive: true },
    { id: 'INT-12 [T - NOW]', inQty: 1850, outQty: 1100, net: 750, isPositive: true },
  ];

  // Categories capital distribution
  const categoryAllocations = [
    {
      code: '01',
      name: 'STATIONERY',
      allocPct: '43.5%',
      valuation: 291230.0,
      velocity: '5.4x',
      drift: '+1.2%',
      driftStatus: 'CONTROLLED',
      skuDensity: 142,
      isAlert: false,
    },
    {
      code: '02',
      name: 'OFFICE SUPPLIES',
      allocPct: '35.2%',
      valuation: 241200.0,
      velocity: '4.1x',
      drift: '-2.8%',
      driftStatus: 'LAGGING',
      skuDensity: 98,
      isAlert: false,
    },
    {
      code: '03',
      name: 'TECH ACCESSORIES',
      allocPct: '22.3%',
      valuation: 152820.0,
      velocity: '4.9x',
      drift: '+4.1%',
      driftStatus: 'CRITICAL FLUX',
      skuDensity: 54,
      isAlert: true,
    },
  ];

  // SKU drift radar items
  const skuRadar = [
    {
      code: 'STN-001',
      name: 'A4 Ruled Notebook 200p',
      classType: 'FAST',
      turns: '8.4x',
      doi: '8.5d',
      drift: '+6.2%',
      status: '[SURGE]',
      vectorColor: 'text-[#FF3D00]',
    },
    {
      code: 'PPR-021',
      name: 'A4 Copier Paper 75 GSM',
      classType: 'FAST',
      turns: '7.1x',
      doi: '12.1d',
      drift: '+1.8%',
      status: '[STEADY]',
      vectorColor: 'text-[#00C853]',
    },
    {
      code: 'OFF-008',
      name: 'Heavy Duty Stapler 24/6',
      classType: 'SLOW',
      turns: '1.2x',
      doi: '58.4d',
      drift: '-4.1%',
      status: '[DRAG]',
      vectorColor: 'text-[#E5A100]',
    },
    {
      code: 'MRK-033',
      name: 'Whiteboard Marker (Red)',
      classType: 'SLOW',
      turns: '0.9x',
      doi: '84.0d',
      drift: '-5.8%',
      status: '[STAGNANT]',
      vectorColor: 'text-[#0D0D0F]',
    },
  ];

  // Handle export functions
  const handleExportCSV = () => {
    exportToCSV(products, 'StockWise_Inventory_Drift_Audit', [
      { header: 'SKU Code', key: 'sku' },
      { header: 'Product Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'Current On-Hand', key: 'current_quantity' },
      { header: 'Reorder Level', key: 'reorder_level' },
      { header: 'Target Stock', key: 'target_stock_level' },
      { header: 'Purchase Cost (INR)', key: p => p.purchase_price },
      { header: 'Asset Value (INR)', key: p => (p.current_quantity * p.purchase_price).toFixed(2) },
      { header: 'Selling Price (INR)', key: p => p.selling_price },
    ]);
  };

  const handleExportJSON = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      cluster: 'AP-SOUTH-1',
      node: 'IN-BLR-01',
      engine: 'DETERMINISTIC_DRIFT_V3.1',
      totalValuation: stats.inventoryValuation,
      totalUnits: stats.totalStockQuantity,
      productsCount: stats.totalProducts,
      categories: categoryAllocations,
      radar: skuRadar,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StockWise_Telemetry_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-20 select-none text-[#0D0D0F]">
      {/* 1. Header Telemetry Sub-Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px] text-[#6E6F76] border-b border-[#D7D8DD] pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-[#0D0D0F]">SYS_NODE // ANALYTICS.TELEMETRY</span>
          <span>/</span>
          <span>CLUSTER: AP-SOUTH-1</span>
          <span>/</span>
          <span className="text-[#2F5BFF] font-bold">FEED: INVENT-CORE-V5</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full inline-block" />
          <span className="text-[#00C853] font-bold">CONNECTED: 14 NODES SYNCHRONIZED</span>
        </div>
      </div>

      {/* 2. Main Title Bar & High-Precision Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-[#0D0D0F] uppercase">
              INVENTORY DRIFT &amp; PERFORMANCE TELEMETRY
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 border border-[#2F5BFF] text-[#2F5BFF] font-mono text-[10px] font-bold uppercase tracking-wider">
              LIVE FIFO ENGINE
            </span>
          </div>
          <p className="font-mono text-xs text-[#5A5C64] mt-1 max-w-4xl leading-relaxed">
            Stochastic forecast modeling, deterministic replenishment drift vectors, valuation elasticity,
            and warehouse velocity metrics across high-throughput SKUs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <div className="flex items-center border border-[#D7D8DD] bg-white px-2.5 py-1.5 gap-1.5">
            <Calendar size={13} className="text-[#6E6F76]" />
            <select
              value={selectedRange}
              onChange={e => setSelectedRange(e.target.value as any)}
              className="bg-transparent uppercase font-bold text-[#0D0D0F] focus:outline-none cursor-pointer"
            >
              <option value="90D">RANGE: 90D [Q1-Q2]</option>
              <option value="30D">RANGE: 30D [ROLLING]</option>
              <option value="7D">RANGE: 7D [SPRINT]</option>
            </select>
          </div>

          <div className="flex items-center border border-[#D7D8DD] bg-white px-2.5 py-1.5 gap-1.5">
            <Network size={13} className="text-[#6E6F76]" />
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value as any)}
              className="bg-transparent uppercase font-bold text-[#0D0D0F] focus:outline-none cursor-pointer"
            >
              <option value="MONTE_CARLO">MODEL: MONTE_CARLO // DRIFT</option>
              <option value="DETERMINISTIC">MODEL: DETERMINISTIC // TARGET</option>
              <option value="ARIMA">MODEL: ARIMA // STOCHASTIC-V4</option>
            </select>
          </div>

          <div className="relative group">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D7D8DD] hover:border-[#0D0D0F] text-[#0D0D0F] font-bold transition-colors"
            >
              <Download size={13} />
              <span>EXPORT [.CSV / .JSON]</span>
            </button>
          </div>

          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D0F] text-white hover:bg-[#2F5BFF] transition-colors font-bold uppercase tracking-wider"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>EXECUTE RE-CALIBRATION</span>
          </button>
        </div>
      </div>

      {/* 3. Operational Specification Strip */}
      <div className="bg-[#F8F8FA] border border-[#D7D8DD] p-2.5 font-mono text-[10px] text-[#4E5058] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span>• ENGINE: DETERMINISTIC DRIFT V3.1</span>
          <span>• LATENCY: 14MS</span>
          <span>• CONFIDENCE INTERVAL: 99.8%</span>
          <span>• PRICE BASIS: INR (₹) FIFO</span>
        </div>
        <div className="text-[#00C853] font-bold tracking-wider">
          HASH: 0x9F3028C8A | ALL NODES SYNCHRONIZED
        </div>
      </div>

      {/* 4. Four Sector KPI Cards (Exact replica of screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* SEC-01: CAPITAL VALUATION */}
        <div className="bg-white border border-[#D7D8DD] p-4 flex flex-col justify-between hover:border-[#0D0D0F] transition-colors shadow-2xs">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="font-bold text-[#6E6F76] uppercase tracking-wider">
                SEC-01 // CAPITAL VALUATION
              </span>
              <span className="px-1.5 py-0.5 bg-[#E8F8EE] border border-[#A6E8BA] text-[#008736] font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                OPTIMAL
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-mono text-2xl font-black text-[#0D0D0F] tracking-tight">
                {formatCurrency(stats.inventoryValuation > 0 ? stats.inventoryValuation : 685250)}
              </h3>
              <p className="font-mono text-xs text-[#008736] font-bold mt-1 flex items-center gap-1">
                <span>↑+12.4%</span>
                <span className="text-[#6E6F76] font-normal">vs Baseline (30D)</span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAEBED] flex items-center justify-between font-mono text-[9px] text-[#6E6F76]">
            <span>COST METHOD: FIFO BASIS</span>
            <span className="font-bold text-[#0D0D0F]">STK-VAL: 99.2%</span>
          </div>
        </div>

        {/* SEC-02: REPLENISHMENT DRIFT */}
        <div className="bg-white border border-[#D7D8DD] p-4 flex flex-col justify-between hover:border-[#0D0D0F] transition-colors shadow-2xs">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="font-bold text-[#6E6F76] uppercase tracking-wider">
                SEC-02 // REPLENISHMENT DRIFT
              </span>
              <span className="px-1.5 py-0.5 bg-[#EEF2FF] border border-[#BAC7FF] text-[#2F5BFF] font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F5BFF]" />
                STABLE
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-mono text-2xl font-black text-[#0D0D0F] tracking-tight">
                +3.42%
              </h3>
              <div className="flex items-center justify-between font-mono text-xs text-[#6E6F76] mt-1">
                <span>Variance: <strong className="text-[#0D0D0F]">±0.18%</strong></span>
                <span>Tolerance: <strong className="text-[#0D0D0F]">&lt;5.0%</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAEBED] flex items-center justify-between font-mono text-[9px] text-[#6E6F76]">
            <span>CONFIDENCE: ±1.96σ</span>
            <span className="font-bold text-[#2F5BFF]">NORMAL FLUX</span>
          </div>
        </div>

        {/* SEC-03: VELOCITY COEFFICIENT */}
        <div className="bg-white border border-[#D7D8DD] p-4 flex flex-col justify-between hover:border-[#0D0D0F] transition-colors shadow-2xs">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="font-bold text-[#6E6F76] uppercase tracking-wider">
                SEC-03 // VELOCITY COEFFICIENT
              </span>
              <span className="px-1.5 py-0.5 bg-[#F2F2F4] border border-[#D7D8DD] text-[#4E5058] font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6E6F76]" />
                NOMINAL
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-mono text-2xl font-black text-[#0D0D0F] tracking-tight">
                4.82x
              </h3>
              <div className="flex items-center justify-between font-mono text-xs text-[#6E6F76] mt-1">
                <span>Annualized Turns</span>
                <span>Cycle: <strong className="text-[#0D0D0F]">18.2 Days</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAEBED] flex items-center justify-between font-mono text-[9px] text-[#6E6F76]">
            <span>THROUGHPUT: HIGH</span>
            <span className="font-bold text-[#0D0D0F]">+0.44 YoY</span>
          </div>
        </div>

        {/* SEC-04: STOCKOUT RISK VECTOR (CRITICAL RED) */}
        <div className="bg-[#FFF5F2] border border-[#FF9E80] p-4 flex flex-col justify-between hover:border-[#FF3D00] transition-colors shadow-2xs">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="font-bold text-[#C52B00] uppercase tracking-wider">
                SEC-04 // STOCKOUT RISK VECTOR
              </span>
              <span className="px-1.5 py-0.5 bg-[#FF3D00]/10 border border-[#FF3D00]/40 text-[#FF3D00] font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3D00]" />
                ACTION REQ
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-mono text-2xl font-black text-[#FF3D00] tracking-tight uppercase">
                {stats.lowStockProductsCount > 0 ? `${stats.lowStockProductsCount} SKUs AT RISK` : '3 SKUs AT RISK'}
              </h3>
              <div className="flex items-center justify-between font-mono text-xs text-[#6E6F76] mt-1">
                <span>Shortfall: <strong className="text-[#FF3D00]">₹42,800</strong></span>
                <span>Within <strong className="text-[#0D0D0F]">14 Days</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#FFCCBC] flex items-center justify-between font-mono text-[9px] text-[#8C2300]">
            <span>URGENT VENDOR: BLR-SUP-04</span>
            <span className="font-bold text-[#FF3D00]">HORIZON: D-5</span>
          </div>
        </div>
      </div>

      {/* 5. Middle Section: Drift & Buffer Trajectory + Velocity Flow Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Deterministic Drift & Buffer Trajectory (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#D7D8DD] p-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAEBED] pb-3">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="w-2 h-2 bg-[#0D0D0F]" />
                  <h3 className="font-mono font-bold text-xs text-[#0D0D0F] uppercase tracking-wider">
                    DETERMINISTIC INVENTORY DRIFT &amp; BUFFER TRAJECTORY
                  </h3>
                </div>
                <p className="font-mono text-[10px] text-[#6E6F76] mt-0.5">
                  RES: 12H BINS • INTERVAL: T+0 → T+600
                </p>
              </div>

              <div className="font-mono text-[10px] bg-[#F2F2F4] border border-[#D7D8DD] px-2 py-0.5 text-[#4E5058] font-bold">
                MODEL: STOCHASTIC-V4
              </div>
            </div>

            {/* 4 Metric Callout Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 font-mono text-[10px]">
              <div className="p-2 bg-[#F8F8FA] border border-[#EAEBED]">
                <span className="text-[#6E6F76] block">CURRENT DRIFT</span>
                <span className="font-bold text-[#0D0D0F] text-[11px]">+2.18% (STATIONERY)</span>
              </div>
              <div className="p-2 bg-[#F8F8FA] border border-[#EAEBED]">
                <span className="text-[#6E6F76] block">MAX DISPERSION</span>
                <span className="font-bold text-[#E5A100] text-[11px]">DAY 42 [EAN-890123]</span>
              </div>
              <div className="p-2 bg-[#F8F8FA] border border-[#EAEBED]">
                <span className="text-[#6E6F76] block">DRIFT FLUX COEFFICIENT</span>
                <span className="font-bold text-[#0D0D0F] text-[11px]">0.041 d/HOUR</span>
              </div>
              <div className="p-2 bg-[#FFF3F0] border border-[#FFCCBC]">
                <span className="text-[#FF3D00] block">CRITICAL HORIZON</span>
                <span className="font-bold text-[#FF3D00] text-[11px]">DAY +14.8 [RUNOUT]</span>
              </div>
            </div>

            {/* The Precision Trajectory Chart */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trajectoryData} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="driftAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F5BFF" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#2F5BFF" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F5BFF" stopOpacity={0.06} />
                      <stop offset="95%" stopColor="#2F5BFF" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEBED" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#6E6F76"
                    fontSize={10}
                    fontFamily="IBM Plex Mono, monospace"
                  />
                  <YAxis
                    stroke="#6E6F76"
                    fontSize={10}
                    fontFamily="IBM Plex Mono, monospace"
                    domain={[1000, 1900]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D0D0F',
                      border: '1px solid #333333',
                      borderRadius: '0px',
                      color: '#ffffff',
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                    }}
                  />
                  {/* Critical Floor safety limit */}
                  <ReferenceLine
                    y={1100}
                    stroke="#FF3D00"
                    strokeDasharray="4 4"
                    label={{
                      value: 'CRITICAL SAFETY THRESHOLD [MIN BUFFER: 1,200 UNITS]',
                      position: 'insideBottomLeft',
                      fill: '#FF3D00',
                      fontSize: 9,
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  />
                  {/* Upper Bound Line */}
                  <Line
                    type="monotone"
                    dataKey="upper"
                    stroke="#8E909A"
                    strokeDasharray="3 3"
                    dot={false}
                    name="Upper Bound (+1.96σ)"
                  />
                  {/* Lower Bound Line */}
                  <Line
                    type="monotone"
                    dataKey="lower"
                    stroke="#8E909A"
                    strokeDasharray="3 3"
                    dot={false}
                    name="Lower Bound (-1.96σ)"
                  />
                  {/* Baseline Target */}
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#0D0D0F"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Baseline Target (Deterministic)"
                  />
                  {/* Actual Physical Telemetry Inflow */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#2F5BFF"
                    strokeWidth={2.5}
                    fill="url(#driftAreaGrad)"
                    dot={{ stroke: '#2F5BFF', strokeWidth: 2, r: 3, fill: '#FFFFFF' }}
                    name="Actual Physical Inflow (Telemetry)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Legend & Telemetry Frequency */}
          <div className="mt-3 pt-3 border-t border-[#EAEBED] flex flex-wrap items-center justify-between gap-3 font-mono text-[9px] text-[#6E6F76]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-[#0D0D0F]" />
                Baseline Target (Deterministic Model)
              </span>
              <span className="flex items-center gap-1.5 text-[#0D0D0F] font-bold">
                <span className="w-3 h-0.5 bg-[#2F5BFF]" />
                Actual Physical Inflow (Telemetry)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2 bg-[#2F5BFF]/10 border border-[#8E909A]" />
                Upper/Lower Bounds (±1.96σ)
              </span>
              <span className="flex items-center gap-1.5 text-[#FF3D00]">
                <span className="w-3 h-0.5 border-t border-dashed border-[#FF3D00]" />
                Floor Safety Limit
              </span>
            </div>

            <div className="text-[#0D0D0F] font-bold">
              SAMPLING RATE: 100 Hz // SYNC: 18.2s
            </div>
          </div>
        </div>

        {/* Right: Velocity Flow Matrix (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#D7D8DD] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#EAEBED] pb-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0D0D0F]" />
                <h3 className="font-bold text-xs text-[#0D0D0F] uppercase tracking-wider">
                  VELOCITY FLOW MATRIX
                </h3>
              </div>
              <span className="px-1.5 py-0.5 bg-[#E8F8EE] border border-[#A6E8BA] text-[#008736] font-bold text-[9px]">
                NET +1,670 UNITS
              </span>
            </div>

            <div className="my-3 p-3 bg-[#F8F8FA] border border-[#EAEBED] flex items-center justify-between font-mono">
              <div>
                <span className="text-[9px] text-[#6E6F76] uppercase block">NET VOLUMETRIC DISPLACEMENT</span>
                <span className="text-sm font-bold text-[#0D0D0F]">+1,670.00 UNITS</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#6E6F76] uppercase block">IN/OUT RATIO</span>
                <span className="text-sm font-bold text-[#2F5BFF]">1.34 : 1.0</span>
              </div>
            </div>

            {/* Matrix Rows */}
            <div className="space-y-2 font-mono text-[10px]">
              {flowMatrix.map((item, idx) => (
                <div key={idx} className="p-2 border border-[#EAEBED] hover:border-[#0D0D0F] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-[#4E5058]">
                    <span className="font-bold text-[#0D0D0F]">{item.id}</span>
                    <span className={item.isPositive ? 'text-[#008736] font-bold' : 'text-[#FF3D00] font-bold'}>
                      IN: {item.inQty} // OUT: {item.outQty} ({item.net > 0 ? `+${item.net}` : item.net})
                    </span>
                  </div>

                  <div className="w-full bg-[#EAEBED] h-1.5 flex overflow-hidden">
                    <div
                      className="bg-[#00C853] h-full"
                      style={{ width: `${Math.min(100, (item.inQty / 2000) * 100)}%` }}
                    />
                    <div
                      className="bg-[#0D0D0F] h-full"
                      style={{ width: `${Math.min(100, (item.outQty / 2000) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#EAEBED] flex items-center justify-between font-mono text-[9px] text-[#6E6F76]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#00C853]" /> Stock Inflow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#0D0D0F]" /> Stock Outflux
              </span>
            </div>
            <span className="font-bold text-[#0D0D0F]">AGGREGATED 12 BINS</span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Section: Category Capital Allocation + Fast & Slow Moving Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Left: Category Capital Allocation & Velocity */}
        <div className="bg-white border border-[#D7D8DD] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#EAEBED] pb-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0D0D0F]" />
                <h3 className="font-bold text-xs text-[#0D0D0F] uppercase tracking-wider">
                  CATEGORY CAPITAL ALLOCATION &amp; VELOCITY
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#0D0D0F]">
                VALUATION: ₹6,85,250
              </span>
            </div>

            {/* Category Cards */}
            <div className="space-y-2.5 my-3">
              {categoryAllocations.map(cat => (
                <div
                  key={cat.code}
                  className="p-3 border border-[#EAEBED] hover:border-[#0D0D0F] transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-[#0D0D0F]">
                      {cat.code} // {cat.name} <span className="text-[#6E6F76] font-normal">{cat.allocPct} ALLOC</span>
                    </span>
                    <span className="font-bold text-[#0D0D0F]">{formatCurrency(cat.valuation)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-[#4E5058] pt-1 border-t border-[#F2F2F4]">
                    <div>
                      <span className="text-[#8E909A] block">VELOCITY:</span>
                      <span className="font-bold text-[#0D0D0F]">{cat.velocity}</span>
                    </div>
                    <div>
                      <span className="text-[#8E909A] block">DRIFT:</span>
                      <span className={cat.isAlert ? 'text-[#FF3D00] font-bold' : 'text-[#008736] font-bold'}>
                        {cat.drift} ({cat.driftStatus})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#8E909A] block">SKU DENSITY:</span>
                      <span className="font-bold text-[#0D0D0F]">{cat.skuDensity} ITEMS</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAEBED] flex items-center justify-between font-mono text-[9px] text-[#6E6F76]">
            <span>RACK SENSOR CALIBRATION: WH-01 [BAY-4 THROUGH BAY-9]</span>
            <span className="text-[#008736] font-bold">DELTA ZERO: OK</span>
          </div>
        </div>

        {/* Right: Fast & Slow Moving SKU Drift Radar */}
        <div className="bg-white border border-[#D7D8DD] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#EAEBED] pb-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0D0D0F]" />
                <h3 className="font-bold text-xs text-[#0D0D0F] uppercase tracking-wider">
                  FAST &amp; SLOW MOVING SKU DRIFT RADAR
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#6E6F76]">
                ANALYSIS HORIZON: 30D
              </span>
            </div>

            {/* Radar Table */}
            <div className="overflow-x-auto my-3">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D7D8DD] bg-[#F8F8FA] text-[9px] text-[#6E6F76] uppercase tracking-wider">
                    <th className="py-2 px-2.5">SKU CODE / IDENTIFIER</th>
                    <th className="py-2 px-2 text-center">CLASS</th>
                    <th className="py-2 px-2.5 text-right">TURNS</th>
                    <th className="py-2 px-2.5 text-right">DOI (DAYS)</th>
                    <th className="py-2 px-2.5 text-right">DRIFT VECTOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEBED]">
                  {skuRadar.map(item => (
                    <tr key={item.code} className="hover:bg-[#F8F8FA] transition-colors">
                      <td className="py-2.5 px-2.5">
                        <div className="font-bold text-[#0D0D0F]">{item.code}</div>
                        <div className="text-[10px] text-[#6E6F76] truncate max-w-[150px]">{item.name}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold ${
                            item.classType === 'FAST'
                              ? 'bg-[#E8F8EE] text-[#008736] border border-[#A6E8BA]'
                              : 'bg-[#F2F2F4] text-[#4E5058] border border-[#D7D8DD]'
                          }`}
                        >
                          {item.classType}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-bold text-[#0D0D0F]">{item.turns}</td>
                      <td className="py-2.5 px-2.5 text-right text-[#4E5058]">{item.doi}</td>
                      <td className={`py-2.5 px-2.5 text-right font-bold ${item.vectorColor}`}>
                        {item.drift} {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAEBED] flex items-center justify-between font-mono text-[9px] text-[#6E6F76]">
            <span>DOI: DAYS OF INVENTORY REMAINING</span>
            <span className="font-bold text-[#0D0D0F]">STAGNANT CAPITAL: ₹54,120</span>
          </div>
        </div>
      </div>

      {/* 7. Bottom Docked AI Rebalancing Alert Banner (From Screenshot) */}
      {!bannerDismissed && (
        <div className="bg-[#0D0D0F] text-white p-4 border border-[#222226] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-none bg-[#2F5BFF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-[#00C853] font-bold uppercase tracking-wider">
                  AUTONOMOUS SYSTEM AUDIT // GEMINI PREDICTIVE ENGINE [V4.2 ACTIVE]
                </span>
                <span className="text-white/40">·</span>
                <span className="text-white/70">CONFIDENCE: 98.4%</span>
              </div>
              <p className="font-mono text-xs text-white/80 mt-1 max-w-4xl leading-relaxed">
                Drift analysis indicates potential capital over-allocation in <strong className="text-white">Office Supplies</strong> (+18 days excess buffer) and an impending runout vector on <strong className="text-[#FF9E80]">STN-001</strong> within 72 hours. Recommended inventory redistribution will recover <strong className="text-[#00C853]">₹28,400</strong> in locked working capital.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center font-mono text-xs whitespace-nowrap">
            <button
              onClick={() => setBannerDismissed(true)}
              className="px-3 py-1.5 text-white/70 hover:text-white transition-colors uppercase font-bold"
            >
              DISMISS
            </button>
            <button
              onClick={() => {
                setRebalancingActive(true);
                setTimeout(() => setRebalancingActive(false), 2500);
              }}
              className="px-3.5 py-1.5 bg-[#2F5BFF] text-white hover:bg-[#1D44DB] transition-colors font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>{rebalancingActive ? 'BALANCING STOCKS...' : 'APPLY REBALANCING →'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
