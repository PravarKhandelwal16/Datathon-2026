import React, { useState } from 'react';
import {
  ResponsiveContainer, Area, LineChart, Line,
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart,
  ReferenceLine, Cell
} from 'recharts';
import {
  Brain, TrendingUp, AlertTriangle, Search, BarChart2,
  Network, Zap, Target, Activity, MapPin, Users,
  Info, Clock, Shield, ArrowUpRight,
  ArrowDownRight, Minus, Calendar, Cpu
} from 'lucide-react';

// ─── Palette helpers ──────────────────────────────────────────────────────────
const C = {
  red:    '#dc2626', orange: '#ea580c', amber: '#d97706',
  green:  '#059669', blue:   '#0284c7', violet: '#7c3aed',
  pink:   '#db2777', teal:   '#0d9488', sky:    '#0ea5e9',
};

// ─── Tooltip style shared ─────────────────────────────────────────────────────
const TT: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary)',
  borderColor:     'var(--border-color)',
  borderRadius:    '8px',
  fontSize:        '0.78rem',
  color:           'var(--text-primary)',
};

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════════

// ─── Tab 3a: Socio-Economic Correlation ───────────────────────────────────────
const socioEconDistricts = [
  { district: 'Bengaluru Urban', urbanization: 94, povertyIdx: 18, crimeRate: 312, unemployment: 6.2,  pop: 1300, literacy: 88 },
  { district: 'Bengaluru Rural', urbanization: 42, povertyIdx: 34, crimeRate: 98,  unemployment: 9.1,  pop: 110,  literacy: 72 },
  { district: 'Mysuru',          urbanization: 71, povertyIdx: 24, crimeRate: 194, unemployment: 7.8,  pop: 400,  literacy: 80 },
  { district: 'Hubballi-Dharwad',urbanization: 62, povertyIdx: 30, crimeRate: 152, unemployment: 8.5,  pop: 290,  literacy: 75 },
  { district: 'Kalaburagi',      urbanization: 38, povertyIdx: 52, crimeRate: 134, unemployment: 14.2, pop: 210,  literacy: 58 },
  { district: 'Belagavi',        urbanization: 55, povertyIdx: 38, crimeRate: 118, unemployment: 10.1, pop: 245,  literacy: 68 },
  { district: 'Mangaluru',       urbanization: 74, povertyIdx: 20, crimeRate: 88,  unemployment: 5.8,  pop: 220,  literacy: 86 },
  { district: 'Shivamogga',      urbanization: 58, povertyIdx: 28, crimeRate: 82,  unemployment: 7.2,  pop: 180,  literacy: 78 },
  { district: 'Raichur',         urbanization: 32, povertyIdx: 61, crimeRate: 148, unemployment: 16.4, pop: 190,  literacy: 48 },
  { district: 'Vijayapura',      urbanization: 44, povertyIdx: 45, crimeRate: 126, unemployment: 12.8, pop: 200,  literacy: 61 },
];
const urbanizationOverlay = [
  { year: 2018, urban: 36, crime: 1820, poverty: 48 },
  { year: 2019, urban: 38, crime: 1940, poverty: 45 },
  { year: 2020, urban: 39, crime: 1680, poverty: 46 }, // pandemic dip
  { year: 2021, urban: 40, crime: 1920, poverty: 44 },
  { year: 2022, urban: 42, crime: 2180, poverty: 41 },
  { year: 2023, urban: 44, crime: 2340, poverty: 38 },
  { year: 2024, urban: 46, crime: 2510, poverty: 36 },
  { year: 2025, urban: 48, crime: 2680, poverty: 34 },
];

// ─── Tab 3b: Predictive Risk Scoring ──────────────────────────────────────────
const riskForecast = [
  { month: 'Jan', actual: 1820, predicted: 1850,  upper: 1970,  lower: 1730 },
  { month: 'Feb', actual: 1940, predicted: 1910,  upper: 2040,  lower: 1780 },
  { month: 'Mar', actual: 2100, predicted: 2080,  upper: 2210,  lower: 1950 },
  { month: 'Apr', actual: 1980, predicted: 2020,  upper: 2160,  lower: 1880 },
  { month: 'May', actual: 2240, predicted: 2200,  upper: 2350,  lower: 2050 },
  { month: 'Jun', actual: 2380, predicted: 2350,  upper: 2500,  lower: 2200 },
  { month: 'Jul', actual: 2510, predicted: 2480,  upper: 2640,  lower: 2320 },
  { month: 'Aug', actual: null, predicted: 2620,  upper: 2800,  lower: 2440 },
  { month: 'Sep', actual: null, predicted: 2750,  upper: 2950,  lower: 2550 },
  { month: 'Oct', actual: null, predicted: 2900,  upper: 3110,  lower: 2690 },
  { month: 'Nov', actual: null, predicted: 3040,  upper: 3270,  lower: 2810 },
  { month: 'Dec', actual: null, predicted: 3180,  upper: 3420,  lower: 2940 },
];
const districtRiskScores = [
  { district: 'Bengaluru Urban', current: 91, predicted: 96, trend: 'up',   category: 'critical' },
  { district: 'Kalaburagi',      current: 78, predicted: 85, trend: 'up',   category: 'high' },
  { district: 'Raichur',         current: 74, predicted: 80, trend: 'up',   category: 'high' },
  { district: 'Mysuru',          current: 69, predicted: 72, trend: 'up',   category: 'high' },
  { district: 'Vijayapura',      current: 64, predicted: 66, trend: 'stable', category: 'medium' },
  { district: 'Belagavi',        current: 58, predicted: 55, trend: 'down', category: 'medium' },
  { district: 'Hubballi-Dharwad',current: 55, predicted: 57, trend: 'stable', category: 'medium' },
  { district: 'Mangaluru',       current: 38, predicted: 35, trend: 'down', category: 'low' },
  { district: 'Shivamogga',      current: 32, predicted: 30, trend: 'down', category: 'low' },
  { district: 'Bengaluru Rural', current: 44, predicted: 46, trend: 'up',   category: 'medium' },
];
const crimeTypeForecast = [
  { category: 'Theft',      current: 42, q1: 44, q2: 47, q3: 51 },
  { category: 'Assault',    current: 18, q1: 17, q2: 16, q3: 15 },
  { category: 'Fraud',      current: 15, q1: 18, q2: 22, q3: 26 },
  { category: 'Narcotics',  current: 12, q1: 14, q2: 16, q3: 19 },
  { category: 'Cyber',      current: 8,  q1: 12, q2: 16, q3: 22 },
  { category: 'Burglary',   current: 5,  q1: 4,  q2: 4,  q3: 3 },
];

// ─── Tab 3c: Anomaly Detection ─────────────────────────────────────────────────
const anomalyTimeSeries = [
  { time: '00:00', rate: 12,  baseline: 14, anomaly: null },
  { time: '01:00', rate: 8,   baseline: 10, anomaly: null },
  { time: '02:00', rate: 6,   baseline: 8,  anomaly: null },
  { time: '03:00', rate: 5,   baseline: 7,  anomaly: null },
  { time: '04:00', rate: 4,   baseline: 6,  anomaly: null },
  { time: '05:00', rate: 7,   baseline: 8,  anomaly: null },
  { time: '06:00', rate: 18,  baseline: 16, anomaly: null },
  { time: '07:00', rate: 38,  baseline: 35, anomaly: null },
  { time: '08:00', rate: 52,  baseline: 50, anomaly: null },
  { time: '09:00', rate: 48,  baseline: 46, anomaly: null },
  { time: '10:00', rate: 44,  baseline: 42, anomaly: null },
  { time: '11:00', rate: 41,  baseline: 40, anomaly: null },
  { time: '12:00', rate: 55,  baseline: 44, anomaly: 55 }, // lunch spike anomaly
  { time: '13:00', rate: 48,  baseline: 42, anomaly: null },
  { time: '14:00', rate: 40,  baseline: 38, anomaly: null },
  { time: '15:00', rate: 38,  baseline: 36, anomaly: null },
  { time: '16:00', rate: 42,  baseline: 40, anomaly: null },
  { time: '17:00', rate: 58,  baseline: 52, anomaly: null },
  { time: '18:00', rate: 72,  baseline: 62, anomaly: null },
  { time: '19:00', rate: 88,  baseline: 70, anomaly: 88 }, // evening rush anomaly
  { time: '20:00', rate: 138, baseline: 76, anomaly: 138 }, // major anomaly
  { time: '21:00', rate: 102, baseline: 74, anomaly: 102 },
  { time: '22:00', rate: 64,  baseline: 58, anomaly: null },
  { time: '23:00', rate: 28,  baseline: 30, anomaly: null },
];
interface AnomalyEvent {
  id: string; time: string; district: string; category: string;
  deviation: number; confidence: number; severity: 'critical' | 'high' | 'medium';
  description: string; linkedCases: number;
}
const anomalyEvents: AnomalyEvent[] = [
  { id: 'A1', time: '20:14', district: 'Bengaluru Urban', category: 'Chain Snatching', deviation: 81, confidence: 97, severity: 'critical', description: 'Activity rate 81% above 30-day baseline. 14 incidents in 45 min window near Majestic. Coordinated gang pattern suspected.', linkedCases: 14 },
  { id: 'A2', time: '19:08', district: 'Mysuru',          category: 'Vehicle Theft',   deviation: 26, confidence: 84, severity: 'high',     description: 'Cluster of 6 vehicle thefts in a 3km radius near Mysuru City Market. Same MO as FIR/189/2024 gang.', linkedCases: 6 },
  { id: 'A3', time: '12:22', district: 'Bengaluru Urban', category: 'ATM Fraud',       deviation: 25, confidence: 79, severity: 'high',     description: 'Unusual spike in ATM fraud complaints (9 cases) during lunch hour — targets office-goers near CBD.', linkedCases: 9 },
  { id: 'A4', time: '21:05', district: 'Kalaburagi',      category: 'Narcotics',       deviation: 44, confidence: 91, severity: 'critical', description: 'Border area activity 44% above norm. Suspected cross-state drug courier movement along NH-150A.', linkedCases: 3 },
];

// ─── Tab 4: Pattern & Trend Discovery ─────────────────────────────────────────
const temporalHeatmap: { hour: number; day: string; value: number }[] = [];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const baseHourPattern = [5,3,2,2,2,3,8,28,45,40,36,34,33,31,30,32,38,52,70,95,110,82,50,22];
DAYS.forEach((day, di) => {
  baseHourPattern.forEach((base, hour) => {
    const dayFactor = di >= 5 ? 1.35 : 1; // weekends higher
    const noise = (Math.random() - 0.5) * 14;
    temporalHeatmap.push({ hour, day, value: Math.max(1, Math.round(base * dayFactor + noise)) });
  });
});

const monthlyTrend12 = [
  { month: 'Aug 24', theft: 320, assault: 140, fraud: 95, narcotics: 72, cyber: 48 },
  { month: 'Sep 24', theft: 298, assault: 128, fraud: 108, narcotics: 68, cyber: 55 },
  { month: 'Oct 24', theft: 345, assault: 152, fraud: 112, narcotics: 80, cyber: 60 },
  { month: 'Nov 24', theft: 312, assault: 135, fraud: 125, narcotics: 74, cyber: 72 },
  { month: 'Dec 24', theft: 368, assault: 164, fraud: 118, narcotics: 88, cyber: 78 },
  { month: 'Jan 25', theft: 388, assault: 158, fraud: 140, narcotics: 92, cyber: 85 },
  { month: 'Feb 25', theft: 355, assault: 142, fraud: 155, narcotics: 86, cyber: 98 },
  { month: 'Mar 25', theft: 410, assault: 172, fraud: 162, narcotics: 98, cyber: 108 },
  { month: 'Apr 25', theft: 398, assault: 168, fraud: 172, narcotics: 105, cyber: 118 },
  { month: 'May 25', theft: 432, assault: 180, fraud: 185, narcotics: 112, cyber: 128 },
  { month: 'Jun 25', theft: 448, assault: 185, fraud: 198, narcotics: 120, cyber: 140 },
  { month: 'Jul 25', theft: 465, assault: 188, fraud: 212, narcotics: 128, cyber: 155 },
];

const resourceDeployment = [
  { district: 'Bengaluru Urban', required: 112, deployed: 88,  gap: 24 },
  { district: 'Kalaburagi',      required: 52,  deployed: 34,  gap: 18 },
  { district: 'Raichur',         required: 44,  deployed: 28,  gap: 16 },
  { district: 'Mysuru',          required: 68,  deployed: 52,  gap: 16 },
  { district: 'Vijayapura',      required: 40,  deployed: 30,  gap: 10 },
  { district: 'Belagavi',        required: 48,  deployed: 44,  gap: 4  },
  { district: 'Hubballi-Dharwad',required: 44,  deployed: 42,  gap: 2  },
  { district: 'Mangaluru',       required: 36,  deployed: 38,  gap: -2 },
  { district: 'Shivamogga',      required: 28,  deployed: 30,  gap: -2 },
];

// ─── Tab 5: Network & Behavioral Analysis ─────────────────────────────────────
const moFrequencyTrend = [
  { month: 'Sep 24', chainSnatch: 48,  vehicleTheft: 62, pickpocket: 38, houseBrk: 22, atmFraud: 15, narcotics: 28 },
  { month: 'Oct 24', chainSnatch: 55,  vehicleTheft: 58, pickpocket: 42, houseBrk: 25, atmFraud: 18, narcotics: 32 },
  { month: 'Nov 24', chainSnatch: 62,  vehicleTheft: 65, pickpocket: 40, houseBrk: 28, atmFraud: 24, narcotics: 38 },
  { month: 'Dec 24', chainSnatch: 70,  vehicleTheft: 72, pickpocket: 52, houseBrk: 32, atmFraud: 28, narcotics: 42 },
  { month: 'Jan 25', chainSnatch: 65,  vehicleTheft: 68, pickpocket: 45, houseBrk: 30, atmFraud: 35, narcotics: 48 },
  { month: 'Feb 25', chainSnatch: 72,  vehicleTheft: 75, pickpocket: 50, houseBrk: 35, atmFraud: 42, narcotics: 52 },
  { month: 'Mar 25', chainSnatch: 80,  vehicleTheft: 80, pickpocket: 58, houseBrk: 38, atmFraud: 50, narcotics: 58 },
  { month: 'Apr 25', chainSnatch: 88,  vehicleTheft: 85, pickpocket: 62, houseBrk: 40, atmFraud: 60, narcotics: 64 },
  { month: 'May 25', chainSnatch: 95,  vehicleTheft: 92, pickpocket: 68, houseBrk: 44, atmFraud: 72, narcotics: 70 },
  { month: 'Jun 25', chainSnatch: 102, vehicleTheft: 98, pickpocket: 75, houseBrk: 48, atmFraud: 84, narcotics: 78 },
];
const suspectProfileRadar = [
  { trait: 'Recidivism',      value: 82 },
  { trait: 'Gang Affiliation',value: 68 },
  { trait: 'Cross-District',  value: 74 },
  { trait: 'Weapon Use',      value: 45 },
  { trait: 'Cyber Overlay',   value: 38 },
  { trait: 'Night Activity',  value: 71 },
  { trait: 'Victim Profile',  value: 60 },
];
const orgCrimeNetwork = [
  { name: 'Majestic Gang (BNG)',  members: 7,  activeCases: 12, riskScore: 96, trend: 'up',   moTags: ['Chain Snatching','Pickpocket','Vehicle Theft'] },
  { name: 'NH-150A Cartel',       members: 12, activeCases: 8,  riskScore: 91, trend: 'up',   moTags: ['Narcotics','Extortion','Land Grab'] },
  { name: 'Mysuru Market Crew',   members: 4,  activeCases: 6,  riskScore: 78, trend: 'stable', moTags: ['Vehicle Theft','House Breaking'] },
  { name: 'Digital Fraud Ring',   members: 9,  activeCases: 18, riskScore: 85, trend: 'up',   moTags: ['ATM Fraud','Cyber','Identity Theft'] },
  { name: 'Coastal Smugglers',    members: 15, activeCases: 4,  riskScore: 72, trend: 'down', moTags: ['Narcotics','Smuggling'] },
];
const jxnMoMatrix = [
  { district: 'BNG Urban', chainSnatch: 95, vehicleTheft: 78, fraud: 68, narcotics: 48, burglary: 32 },
  { district: 'Mysuru',    chainSnatch: 60, vehicleTheft: 88, fraud: 42, narcotics: 38, burglary: 75 },
  { district: 'Kalaburagi',chainSnatch: 30, vehicleTheft: 45, fraud: 35, narcotics: 92, burglary: 28 },
  { district: 'Hubballi',  chainSnatch: 50, vehicleTheft: 62, fraud: 55, narcotics: 44, burglary: 38 },
  { district: 'Belagavi',  chainSnatch: 42, vehicleTheft: 58, fraud: 48, narcotics: 52, burglary: 30 },
];

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, subtitle, children, style }) => (
  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', ...style }}>
    <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
      <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{title}</h3>
      {subtitle && <p style={{ margin: 0, fontSize: '0.72rem', marginTop: '0.2rem' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const StatBadge: React.FC<{ label: string; value: string | number; color: string; icon: React.ReactNode; sub?: string }> =
  ({ label, value, color, icon, sub }) => (
    <div className="glass-panel" style={{ padding: '0.75rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
      <div style={{ padding: '0.45rem', background: `${color}18`, borderRadius: '7px', flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );

// SectionLabel reserved for future panels

const RiskBar: React.FC<{ score: number; max?: number }> = ({ score, max = 100 }) => {
  const pct = (score / max) * 100;
  const color = score >= 85 ? C.red : score >= 65 ? C.orange : score >= 45 ? C.amber : C.green;
  return (
    <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-tertiary)', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB PANELS
// ══════════════════════════════════════════════════════════════════════════════

// ─── TAB: Socio-Economic Correlation ─────────────────────────────────────────
const TabSocioEcon: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {/* Ribbon */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem', flexShrink: 0 }}>
      <StatBadge label="Urbanization-Crime r²" value="0.81"   color={C.violet} icon={<MapPin size={16} color={C.violet} />} sub="Strong positive correlation" />
      <StatBadge label="Poverty Index Impact"   value="+2.4×" color={C.red}    icon={<Users size={16} color={C.red} />}    sub="Per unit increase in crime" />
      <StatBadge label="Unemployment Corr."     value="0.74"   color={C.orange} icon={<Activity size={16} color={C.orange} />} sub="District level R²" />
      <StatBadge label="Literacy Inverse Corr." value="-0.68"  color={C.green}  icon={<Brain size={16} color={C.green} />}  sub="Crime rate vs literacy" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
      {/* Scatter: urbanization vs crime rate (bubble = population) */}
      <Panel title="Urbanization vs. Crime Rate" subtitle="Bubble size = population (thousands) · Color = poverty index severity">
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="urbanization" name="Urbanization %" type="number" domain={[25, 100]}
                label={{ value: 'Urbanization %', position: 'insideBottom', offset: -12, fill: 'var(--text-secondary)', fontSize: 11 }}
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis dataKey="crimeRate" name="Crime Rate /100k" type="number"
                label={{ value: 'Crime Rate /100k', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)', fontSize: 11 }}
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip contentStyle={TT} cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ ...TT, padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.district}</div>
                      <div style={{ fontSize: '0.72rem' }}>Urbanization: <b>{d.urbanization}%</b></div>
                      <div style={{ fontSize: '0.72rem' }}>Crime Rate: <b>{d.crimeRate}/100k</b></div>
                      <div style={{ fontSize: '0.72rem' }}>Poverty Index: <b>{d.povertyIdx}</b></div>
                      <div style={{ fontSize: '0.72rem' }}>Unemployment: <b>{d.unemployment}%</b></div>
                      <div style={{ fontSize: '0.72rem' }}>Literacy: <b>{d.literacy}%</b></div>
                    </div>
                  );
                }}
              />
              <Scatter data={socioEconDistricts} fill={C.violet}
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  const r = Math.sqrt(payload.pop) * 0.8;
                  const opacity = 0.25 + (payload.povertyIdx / 100) * 0.55;
                  return <circle cx={cx} cy={cy} r={r} fill={C.violet} fillOpacity={opacity} stroke={C.violet} strokeWidth={1.5} />;
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Dual-axis: urbanization growth + crime trend over years */}
      <Panel title="Urbanization Growth vs. Crime Trend" subtitle="Karnataka 2018–2025 aggregated">
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={urbanizationOverlay} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip contentStyle={TT} />
              <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
              <Bar yAxisId="left" dataKey="crime" name="Total Crimes" fill={C.red} fillOpacity={0.5} radius={[3,3,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="urban" name="Urbanization %" stroke={C.violet} strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="poverty" name="Poverty Index" stroke={C.green} strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>

    {/* Socio-Economic index table */}
    <Panel title="District Socio-Economic & Crime Index" style={{ flexShrink: 0, padding: '0.9rem 1rem' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              {['District', 'Urbanization', 'Poverty Idx', 'Unemployment', 'Literacy %', 'Crime Rate', 'Risk'].map(h => (
                <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {socioEconDistricts.sort((a,b) => b.crimeRate - a.crimeRate).map((d, i) => {
              const risk = Math.round(d.crimeRate / 3.5 + d.povertyIdx * 0.4 + (100 - d.literacy) * 0.3 + d.unemployment * 1.2);
              const riskColor = risk >= 80 ? C.red : risk >= 60 ? C.orange : risk >= 40 ? C.amber : C.green;
              return (
                <tr key={d.district} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.district}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}>{d.urbanization}%</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: d.povertyIdx >= 45 ? C.red : d.povertyIdx >= 30 ? C.amber : C.green, fontWeight: 600 }}>{d.povertyIdx}</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}>{d.unemployment}%</td>
                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}>{d.literacy}%</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.crimeRate}/100k</td>
                  <td style={{ padding: '0.4rem 0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: riskColor }}>{risk}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  </div>
);

// ─── TAB: Predictive Risk Scoring ─────────────────────────────────────────────
const TabPredictive: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem', flexShrink: 0 }}>
      <StatBadge label="Forecast Horizon"     value="6 mo"  color={C.blue}   icon={<Calendar size={16} color={C.blue} />}   sub="AI confidence: 87%" />
      <StatBadge label="High-Risk Districts"  value="4"     color={C.red}    icon={<Target size={16} color={C.red} />}     sub="Risk score ≥ 65" />
      <StatBadge label="Predicted Crime Growth"value="+19%" color={C.orange} icon={<TrendingUp size={16} color={C.orange} />} sub="Q4 2025 projection" />
      <StatBadge label="Model Accuracy"        value="91.4%" color={C.green}  icon={<Cpu size={16} color={C.green} />}     sub="Backtested 24 months" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
      {/* Forecast chart */}
      <Panel title="Crime Volume Forecast — Karnataka" subtitle="AI model prediction with 80% confidence interval · Dashed = projected">
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={riskForecast} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} domain={[1500, 3600]} />
              <Tooltip contentStyle={TT} />
              <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
              {/* Confidence band */}
              <Area type="monotone" dataKey="upper" fill={C.orange} stroke="transparent" fillOpacity={0.12} name="Upper Bound" />
              <Area type="monotone" dataKey="lower" fill="var(--bg-secondary)" stroke="transparent" fillOpacity={1} name="Lower Bound" legendType="none" />
              {/* Actual */}
              <Line type="monotone" dataKey="actual" stroke={C.red} strokeWidth={2.5} dot={{ r: 3, fill: C.red }} name="Actual" connectNulls={false} />
              {/* Predicted */}
              <Line type="monotone" dataKey="predicted" stroke={C.orange} strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Forecast" />
              <ReferenceLine x="Jul" stroke="var(--border-color)" strokeDasharray="4 4" label={{ value: 'Forecast Start', position: 'top', fill: 'var(--text-secondary)', fontSize: 10 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* District risk scores */}
      <Panel title="District AI Risk Scores" subtitle="Current vs predicted next quarter">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
          {districtRiskScores.map(d => {
            const color = d.current >= 85 ? C.red : d.current >= 65 ? C.orange : d.current >= 45 ? C.amber : C.green;
            const trendIcon = d.trend === 'up' ? <ArrowUpRight size={12} color={C.red} /> : d.trend === 'down' ? <ArrowDownRight size={12} color={C.green} /> : <Minus size={12} color={C.amber} />;
            return (
              <div key={d.district} style={{ padding: '0.55rem 0.65rem', borderRadius: 7, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.district}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {trendIcon}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{d.current}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>→ {d.predicted}</span>
                  </div>
                </div>
                <RiskBar score={d.current} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>

    {/* Crime Type Forecast */}
    <Panel title="Crime Category Growth Forecast — Next 3 Quarters (%)" style={{ flexShrink: 0 }}>
      <div style={{ height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={crimeTypeForecast} barCategoryGap="30%" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} unit="%" />
            <Tooltip contentStyle={TT} formatter={(v: any) => [`${v}%`]} />
            <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
            <Bar dataKey="current" name="Current" fill={C.blue} radius={[2,2,0,0]} />
            <Bar dataKey="q1"      name="Q1 Forecast" fill={C.amber} radius={[2,2,0,0]} />
            <Bar dataKey="q2"      name="Q2 Forecast" fill={C.orange} radius={[2,2,0,0]} />
            <Bar dataKey="q3"      name="Q3 Forecast" fill={C.red} radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  </div>
);

// ─── TAB: Anomaly Detection ───────────────────────────────────────────────────
const TabAnomaly: React.FC = () => {
  const [selected, setSelected] = useState<AnomalyEvent | null>(anomalyEvents[0]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem', flexShrink: 0 }}>
        <StatBadge label="Anomalies Detected"   value={anomalyEvents.length}    color={C.red}    icon={<Zap size={16} color={C.red} />}    sub="Last 24 hours" />
        <StatBadge label="Critical Anomalies"   value={anomalyEvents.filter(a => a.severity === 'critical').length} color={C.red} icon={<AlertTriangle size={16} color={C.red} />} sub="Immediate attention" />
        <StatBadge label="Avg Deviation"        value="44%"  color={C.orange} icon={<Activity size={16} color={C.orange} />} sub="Above baseline" />
        <StatBadge label="Detection Confidence" value="88%"  color={C.green}  icon={<Shield size={16} color={C.green} />}  sub="ML model accuracy" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1rem' }}>
        {/* Time-series anomaly chart */}
        <Panel title="24-Hour Activity vs. Baseline — Anomaly Detection" subtitle="Orange dots = detected anomalies exceeding 2σ threshold">
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={anomalyTimeSeries} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} interval={2} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip contentStyle={TT} />
                <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
                {/* Baseline band */}
                <Area type="monotone" dataKey="baseline" name="30-Day Baseline" fill={C.blue} stroke={C.blue} strokeWidth={1.5} strokeDasharray="4 3" fillOpacity={0.08} dot={false} />
                {/* Actual */}
                <Line type="monotone" dataKey="rate" name="Activity Rate" stroke={C.amber} strokeWidth={2} dot={false} />
                {/* Anomaly dots */}
                <Line type="monotone" dataKey="anomaly" name="Anomaly" stroke={C.red} strokeWidth={0} dot={{ r: 7, fill: C.red, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 9 }} />
                {/* Reference lines at anomaly times */}
                <ReferenceLine x="20:00" stroke={C.red} strokeDasharray="3 3" strokeOpacity={0.5} />
                <ReferenceLine x="19:00" stroke={C.orange} strokeDasharray="3 3" strokeOpacity={0.5} />
                <ReferenceLine x="12:00" stroke={C.orange} strokeDasharray="3 3" strokeOpacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Anomaly events list + detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Panel title="Detected Anomaly Events" style={{ flex: '0 0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {anomalyEvents.map(ev => (
                <button key={ev.id} onClick={() => setSelected(ev)} style={{
                  textAlign: 'left', padding: '0.55rem 0.65rem', borderRadius: 7,
                  border: `1px solid ${selected?.id === ev.id ? (ev.severity === 'critical' ? C.red : C.orange) : 'var(--border-color)'}`,
                  background: selected?.id === ev.id ? `${ev.severity === 'critical' ? C.red : C.orange}10` : 'var(--bg-tertiary)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: ev.severity === 'critical' ? C.red : C.orange, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ev.district}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{ev.time}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: ev.severity === 'critical' ? C.red : C.orange, fontWeight: 600, marginTop: 2 }}>
                    {ev.category} · +{ev.deviation}% deviation
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          {selected && (
            <Panel title="Anomaly Detail" style={{ minHeight: '200px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { l: 'Severity', v: selected.severity, color: selected.severity === 'critical' ? C.red : C.orange },
                    { l: 'Confidence', v: `${selected.confidence}%`, color: C.blue },
                    { l: 'Linked Cases', v: selected.linkedCases, color: C.violet },
                  ].map(item => (
                    <div key={item.l} style={{ padding: '0.35rem 0.6rem', borderRadius: 6, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.l}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0.55rem 0.65rem', background: 'var(--bg-tertiary)', borderRadius: 7, border: '1px solid var(--border-color)' }}>
                  {selected.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: C.red, fontWeight: 600 }}>
                  <AlertTriangle size={12} /> Recommend immediate dispatch to {selected.district}
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Pattern & Trend Discovery ──────────────────────────────────────────
const TabPatterns: React.FC = () => {
  // Build mini heatmap cell data
  const cellMax = Math.max(...temporalHeatmap.map(c => c.value));
  return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem', flexShrink: 0 }}>
        <StatBadge label="Peak Crime Day"   value="Saturday"  color={C.red}    icon={<Calendar size={16} color={C.red} />}    sub="22% above weekday avg" />
        <StatBadge label="Peak Crime Hour"  value="20:00–21:00" color={C.orange} icon={<Clock size={16} color={C.orange} />} sub="110 avg incidents/hr" />
        <StatBadge label="Fastest Growing"  value="Cyber Fraud" color={C.violet} icon={<TrendingUp size={16} color={C.violet} />} sub="+223% in 12 months" />
        <StatBadge label="Resource Gap"     value="68 units"  color={C.amber}  icon={<Shield size={16} color={C.amber} />}  sub="Across 5 understaffed districts" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        {/* Temporal Heatmap */}
        <Panel title="Spatiotemporal Crime Heatmap" subtitle="Day × Hour density — darker = higher crime frequency">
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Hour axis header */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(24, 1fr)', gap: 2, marginBottom: 4 }}>
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {h % 4 === 0 ? `${h}h` : ''}
                </div>
              ))}
            </div>
            {DAYS.map(day => {
              const row = temporalHeatmap.filter(c => c.day === day);
              return (
                <div key={day} style={{ display: 'grid', gridTemplateColumns: '36px repeat(24, 1fr)', gap: 2, marginBottom: 2 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>{day}</div>
                  {row.sort((a,b) => a.hour - b.hour).map(cell => {
                    const intensity = cell.value / cellMax;
                    const bg = intensity >= 0.75 ? '#dc2626'
                             : intensity >= 0.55 ? '#ea580c'
                             : intensity >= 0.35 ? '#d97706'
                             : intensity >= 0.18 ? '#0284c7'
                             : '#e2e8f0';
                    const opacity = 0.25 + intensity * 0.75;
                    return (
                      <div key={cell.hour} title={`${day} ${cell.hour}:00 — ${cell.value} incidents`}
                        style={{ height: 22, borderRadius: 2, background: bg, opacity, cursor: 'default', transition: 'opacity 0.2s' }}
                      />
                    );
                  })}
                </div>
              );
            })}
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Low</span>
              {['#e2e8f0','#0284c7','#d97706','#ea580c','#dc2626'].map((c,i) => (
                <div key={i} style={{ width: 16, height: 10, borderRadius: 2, background: c }} />
              ))}
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>High</span>
            </div>
          </div>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 12-month trend lines */}
          <Panel title="12-Month Crime Category Trends" subtitle="All major categories — Karnataka" style={{ flex: 1 }}>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend12} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} interval={2} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Tooltip contentStyle={TT} />
                  <Legend wrapperStyle={{ fontSize: '0.68rem' }} />
                  <Line type="monotone" dataKey="theft"      name="Theft"       stroke={C.red}    strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="assault"    name="Assault"     stroke={C.orange}  strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="fraud"      name="Fraud"       stroke={C.amber}   strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="narcotics"  name="Narcotics"   stroke={C.violet}  strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cyber"      name="Cyber"       stroke={C.blue}    strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Resource Deployment Gap */}
          <Panel title="Patrol Resource Deployment vs. Requirement" style={{ flex: '0 0 auto' }}>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceDeployment} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }} barCategoryGap="30%">
                  <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <YAxis dataKey="district" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={58} />
                  <Tooltip contentStyle={TT} />
                  <Bar dataKey="deployed"  name="Deployed"   stackId="a" fill={C.green} radius={[0,0,0,0]} />
                  <Bar dataKey="gap" name="Gap / Surplus" stackId="a" fill={C.red} radius={[0,3,3,0]}>
                    {resourceDeployment.map((entry, i) => (
                      <Cell key={i} fill={entry.gap > 0 ? C.red : C.teal} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Network & Behavioral Analysis ───────────────────────────────────────
const TabNetworkBehavior: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.7rem', flexShrink: 0 }}>
      <StatBadge label="Active Crime Networks"  value="5"    color={C.pink}   icon={<Network size={16} color={C.pink} />}   sub="Identified organized groups" />
      <StatBadge label="Top MO: Chain Snatching" value="+112%" color={C.red}  icon={<TrendingUp size={16} color={C.red} />} sub="12-month growth" />
      <StatBadge label="Cross-Jurisdiction MOs"  value="4"    color={C.violet} icon={<MapPin size={16} color={C.violet} />} sub="Spanning 2+ districts" />
      <StatBadge label="Repeat MO Match Rate"    value="78%"  color={C.green}  icon={<Search size={16} color={C.green} />}  sub="FIR-to-profile linkage" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* MO Frequency Trend */}
        <Panel title="Modus Operandi Frequency Trend" subtitle="Monthly incident count by MO type — all Karnataka" style={{ flex: 1 }}>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moFrequencyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} interval={2} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip contentStyle={TT} />
                <Legend wrapperStyle={{ fontSize: '0.68rem' }} />
                <Line type="monotone" dataKey="chainSnatch"  name="Chain Snatching" stroke={C.red}    strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="vehicleTheft" name="Vehicle Theft"   stroke={C.orange} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pickpocket"   name="Pickpocket"      stroke={C.amber}  strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="atmFraud"     name="ATM Fraud"       stroke={C.blue}   strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="houseBrk"     name="House Breaking"  stroke={C.violet} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="narcotics"    name="Narcotics"       stroke={C.pink}   strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* District × MO heatmap table */}
        <Panel title="District × MO Activity Matrix" subtitle="Relative intensity (0–100) — darker = more active" style={{ flexShrink: 0, padding: '0.9rem 1rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['District', 'Chain Snatch', 'Vehicle Theft', 'Fraud', 'Narcotics', 'Burglary'].map(h => (
                    <th key={h} style={{ padding: '0.35rem 0.6rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jxnMoMatrix.map((row, _i) => (
                  <tr key={row.district} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.75rem' }}>{row.district}</td>
                    {[row.chainSnatch, row.vehicleTheft, row.fraud, row.narcotics, row.burglary].map((v, j) => {
                      const bg = v >= 80 ? C.red : v >= 60 ? C.orange : v >= 40 ? C.amber : v >= 20 ? C.blue : 'transparent';
                      const textC = v >= 40 ? 'white' : 'var(--text-primary)';
                      return (
                        <td key={j} style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: 5, background: bg, color: textC, fontWeight: 700, fontSize: '0.75rem', opacity: 0.25 + (v / 100) * 0.75 }}>
                            {v}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Suspect behavioral radar */}
        <Panel title="Aggregate Suspect Behavioral Profile" subtitle="Trait scoring across all repeat offenders" style={{ flex: 1 }}>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={suspectProfileRadar} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <PolarRadiusAxis angle={20} domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
                <Radar name="Behavioral Score" dataKey="value" stroke={C.red} fill={C.red} fillOpacity={0.28} strokeWidth={2} />
                <Tooltip contentStyle={TT} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Org crime network cards */}
        <Panel title="Identified Crime Networks" subtitle="Risk-ranked organized groups" style={{ flex: '0 0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {orgCrimeNetwork.map(org => {
              const color = org.riskScore >= 90 ? C.red : org.riskScore >= 75 ? C.orange : C.amber;
              const trendIcon = org.trend === 'up' ? <ArrowUpRight size={11} color={C.red} /> : org.trend === 'down' ? <ArrowDownRight size={11} color={C.green} /> : <Minus size={11} color={C.amber} />;
              return (
                <div key={org.name} style={{ padding: '0.55rem 0.65rem', borderRadius: 7, border: `1px solid ${color}30`, background: `${color}06` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{org.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {trendIcon}
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{org.riskScore}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>👥 {org.members} members</span>
                    <span>📁 {org.activeCases} active cases</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                    {org.moTags.map(t => (
                      <span key={t} style={{ padding: '0.1rem 0.4rem', borderRadius: 99, fontSize: '0.62rem', fontWeight: 600, background: `${color}15`, color, border: `1px solid ${color}30` }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
type Tab = 'socio' | 'predictive' | 'anomaly' | 'patterns' | 'network';

const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'socio',      label: 'Socio-Economic Correlation', icon: <Users size={13} />,      badge: undefined },
  { id: 'predictive', label: 'Predictive Risk Scoring',    icon: <Brain size={13} />,      badge: 'AI' },
  { id: 'anomaly',    label: 'Anomaly Detection',          icon: <Zap size={13} />,        badge: '4' },
  { id: 'patterns',   label: 'Pattern & Trend Discovery',  icon: <BarChart2 size={13} />,  badge: undefined },
  { id: 'network',    label: 'Network & Behavioral',       icon: <Network size={13} />,    badge: undefined },
];

export const PredictiveInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('predictive');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2.5rem' }}>
      {/* Page header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <Brain size={20} color="var(--accent-primary)" />
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Strategic Intelligence Hub</h2>
          <span style={{ padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(124,58,237,0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)' }}>AI-Driven</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem' }}>Sociological correlations, predictive modeling, anomaly detection, and behavioral pattern analysis across Karnataka</p>
      </div>

      {/* Tab bar */}
      <div className="glass-panel" style={{ padding: '0.4rem 0.7rem', flexShrink: 0, display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`network-tab${activeTab === tab.id ? ' active' : ''}`}
            style={{ gap: '0.4rem' }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : 'var(--accent-primary)',
                color: 'white', borderRadius: 99, fontSize: '0.6rem', fontWeight: 700,
                padding: '0 0.3rem', marginLeft: 2,
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <Info size={12} /> Data: SCRB Karnataka · Model: v2.4
        </div>
      </div>

      {/* Tab content */}
      <div style={{ minHeight: 0 }}>
        {activeTab === 'socio'      && <TabSocioEcon />}
        {activeTab === 'predictive' && <TabPredictive />}
        {activeTab === 'anomaly'    && <TabAnomaly />}
        {activeTab === 'patterns'   && <TabPatterns />}
        {activeTab === 'network'    && <TabNetworkBehavior />}
      </div>
    </div>
  );
};
