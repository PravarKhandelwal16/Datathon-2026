import React, { useState, useMemo, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  AlertTriangle, TrendingUp, MapPin, Clock,
  Layers, Filter, ChevronRight, ChevronDown, X, Activity,
  Radio, Shield, Eye, BarChart2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── Fix Leaflet icon ───────────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Types ──────────────────────────────────────────────────────────────────
type Severity = 'low' | 'medium' | 'high' | 'critical';
type TimeRange = '24h' | '7d' | '30d' | '90d';
type CrimeCategory = 'All' | 'Theft' | 'Assault' | 'Fraud' | 'Narcotics' | 'Cyber' | 'Burglary';
type MapLayer = 'hotspot' | 'category' | 'patrol';

interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
  totalFIRs: number;
  prevPeriodFIRs: number;
  severity: Severity;
  isAlertActive: boolean;
  alertCategory?: CrimeCategory;
  alertSpikePct?: number;
  alertDetectedAt: string;
  crimesByCategory: Record<string, number>;
  crimesByHour: number[];          // 24 buckets
  weeklyTrend: { day: string; count: number }[];
  stationCount: number;
  activePatrols: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const DISTRICTS: District[] = [
  {
    id: 'bng-urban', name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946,
    totalFIRs: 1247, prevPeriodFIRs: 1011, severity: 'critical', isAlertActive: true,
    alertCategory: 'Theft', alertSpikePct: 143, alertDetectedAt: '02:14 AM',
    stationCount: 34, activePatrols: 112,
    crimesByCategory: { Theft: 548, Assault: 274, Fraud: 225, Narcotics: 89, Cyber: 67, Burglary: 44 },
    crimesByHour: [12,8,5,4,3,4,14,38,55,48,42,40,38,36,34,36,40,52,68,95,112,88,55,28],
    weeklyTrend: [
      { day: 'Mon', count: 165 }, { day: 'Tue', count: 178 }, { day: 'Wed', count: 152 },
      { day: 'Thu', count: 192 }, { day: 'Fri', count: 214 }, { day: 'Sat', count: 198 }, { day: 'Sun', count: 148 }
    ],
  },
  {
    id: 'bng-rural', name: 'Bengaluru Rural', lat: 13.1986, lng: 77.7066,
    totalFIRs: 312, prevPeriodFIRs: 295, severity: 'medium', isAlertActive: false,
    alertDetectedAt: '', stationCount: 12, activePatrols: 28,
    crimesByCategory: { Theft: 128, Assault: 76, Fraud: 45, Narcotics: 33, Cyber: 18, Burglary: 12 },
    crimesByHour: [5,3,2,1,1,2,8,18,22,20,18,17,16,15,14,15,18,24,30,38,42,35,22,10],
    weeklyTrend: [
      { day: 'Mon', count: 42 }, { day: 'Tue', count: 46 }, { day: 'Wed', count: 38 },
      { day: 'Thu', count: 50 }, { day: 'Fri', count: 58 }, { day: 'Sat', count: 52 }, { day: 'Sun', count: 26 }
    ],
  },
  {
    id: 'mysuru', name: 'Mysuru', lat: 12.2958, lng: 76.6394,
    totalFIRs: 634, prevPeriodFIRs: 378, severity: 'high', isAlertActive: true,
    alertCategory: 'Burglary', alertSpikePct: 67, alertDetectedAt: '11:42 PM',
    stationCount: 18, activePatrols: 52,
    crimesByCategory: { Theft: 242, Assault: 110, Fraud: 88, Narcotics: 55, Cyber: 29, Burglary: 110 },
    crimesByHour: [8,5,4,3,2,3,10,28,36,32,28,26,24,22,20,22,28,38,50,68,72,60,38,18],
    weeklyTrend: [
      { day: 'Mon', count: 82 }, { day: 'Tue', count: 88 }, { day: 'Wed', count: 74 },
      { day: 'Thu', count: 96 }, { day: 'Fri', count: 110 }, { day: 'Sat', count: 102 }, { day: 'Sun', count: 82 }
    ],
  },
  {
    id: 'hubballi', name: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.1240,
    totalFIRs: 487, prevPeriodFIRs: 451, severity: 'medium', isAlertActive: false,
    alertDetectedAt: '', stationCount: 16, activePatrols: 44,
    crimesByCategory: { Theft: 198, Assault: 102, Fraud: 78, Narcotics: 62, Cyber: 22, Burglary: 25 },
    crimesByHour: [6,4,3,2,2,3,9,22,30,26,22,20,18,17,16,17,20,28,38,54,58,48,30,14],
    weeklyTrend: [
      { day: 'Mon', count: 62 }, { day: 'Tue', count: 68 }, { day: 'Wed', count: 55 },
      { day: 'Thu', count: 72 }, { day: 'Fri', count: 84 }, { day: 'Sat', count: 78 }, { day: 'Sun', count: 68 }
    ],
  },
  {
    id: 'kalaburagi', name: 'Kalaburagi', lat: 17.3297, lng: 76.8200,
    totalFIRs: 389, prevPeriodFIRs: 272, severity: 'high', isAlertActive: true,
    alertCategory: 'Narcotics', alertSpikePct: 43, alertDetectedAt: '08:55 PM',
    stationCount: 14, activePatrols: 36,
    crimesByCategory: { Theft: 128, Assault: 92, Fraud: 55, Narcotics: 78, Cyber: 16, Burglary: 20 },
    crimesByHour: [5,3,2,2,1,2,8,18,24,20,18,16,14,13,12,13,16,22,32,48,52,42,26,12],
    weeklyTrend: [
      { day: 'Mon', count: 52 }, { day: 'Tue', count: 55 }, { day: 'Wed', count: 45 },
      { day: 'Thu', count: 60 }, { day: 'Fri', count: 72 }, { day: 'Sat', count: 68 }, { day: 'Sun', count: 37 }
    ],
  },
  {
    id: 'mangaluru', name: 'Mangaluru', lat: 12.9141, lng: 74.8560,
    totalFIRs: 298, prevPeriodFIRs: 318, severity: 'low', isAlertActive: false,
    alertDetectedAt: '', stationCount: 10, activePatrols: 32,
    crimesByCategory: { Theft: 112, Assault: 68, Fraud: 52, Narcotics: 28, Cyber: 24, Burglary: 14 },
    crimesByHour: [4,2,2,1,1,2,7,16,22,18,16,14,13,12,11,12,15,20,28,40,44,36,22,10],
    weeklyTrend: [
      { day: 'Mon', count: 38 }, { day: 'Tue', count: 42 }, { day: 'Wed', count: 34 },
      { day: 'Thu', count: 46 }, { day: 'Fri', count: 52 }, { day: 'Sat', count: 48 }, { day: 'Sun', count: 38 }
    ],
  },
  {
    id: 'belagavi', name: 'Belagavi', lat: 15.8497, lng: 74.4977,
    totalFIRs: 422, prevPeriodFIRs: 398, severity: 'medium', isAlertActive: false,
    alertDetectedAt: '', stationCount: 15, activePatrols: 40,
    crimesByCategory: { Theft: 168, Assault: 95, Fraud: 72, Narcotics: 48, Cyber: 20, Burglary: 19 },
    crimesByHour: [5,3,2,2,1,2,8,20,27,23,20,18,16,15,14,15,18,24,34,50,54,44,28,12],
    weeklyTrend: [
      { day: 'Mon', count: 55 }, { day: 'Tue', count: 60 }, { day: 'Wed', count: 48 },
      { day: 'Thu', count: 64 }, { day: 'Fri', count: 76 }, { day: 'Sat', count: 70 }, { day: 'Sun', count: 49 }
    ],
  },
  {
    id: 'shivamogga', name: 'Shivamogga', lat: 13.9299, lng: 75.5681,
    totalFIRs: 256, prevPeriodFIRs: 262, severity: 'low', isAlertActive: false,
    alertDetectedAt: '', stationCount: 9, activePatrols: 24,
    crimesByCategory: { Theft: 98, Assault: 58, Fraud: 44, Narcotics: 30, Cyber: 14, Burglary: 12 },
    crimesByHour: [3,2,1,1,1,1,6,14,20,16,14,12,11,10,9,10,13,18,25,36,38,30,18,8],
    weeklyTrend: [
      { day: 'Mon', count: 32 }, { day: 'Tue', count: 36 }, { day: 'Wed', count: 28 },
      { day: 'Thu', count: 40 }, { day: 'Fri', count: 46 }, { day: 'Sat', count: 44 }, { day: 'Sun', count: 30 }
    ],
  },
];

// ─── Colour helpers ──────────────────────────────────────────────────────────
const SEVERITY_COLOR: Record<Severity, string> = {
  critical: '#dc2626',
  high:     '#ea580c',
  medium:   '#d97706',
  low:      '#059669',
};
const SEVERITY_FILL: Record<Severity, string> = {
  critical: 'rgba(220,38,38,0.28)',
  high:     'rgba(234,88,12,0.22)',
  medium:   'rgba(217,119,6,0.2)',
  low:      'rgba(5,150,105,0.18)',
};
const CATEGORY_COLOR: Record<string, string> = {
  Theft: '#dc2626', Assault: '#ea580c', Fraud: '#d97706',
  Narcotics: '#7c3aed', Cyber: '#0284c7', Burglary: '#be185d',
};
const TIME_LABELS: Record<number, string> = {
  0: '12 AM', 3: '3 AM', 6: '6 AM', 9: '9 AM', 12: '12 PM',
  15: '3 PM', 18: '6 PM', 21: '9 PM', 23: '11 PM',
};
function getTimeBracket(h: number): { label: string; color: string } {
  if (h >= 22 || h < 5)  return { label: 'Night (High Risk)', color: '#7c3aed' };
  if (h >= 5 && h < 9)   return { label: 'Morning Rush', color: '#0284c7' };
  if (h >= 9 && h < 18)  return { label: 'Daytime', color: '#059669' };
  return { label: 'Evening Rush', color: '#ea580c' };
}

// ─── Sub-component: Map recenter ─────────────────────────────────────────────
const MapRecenter: React.FC<{ center: [number,number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom, map]);
  return null;
};

// ─── Sub-component: Popup content ───────────────────────────────────────────
const DistrictPopup: React.FC<{ d: District }> = ({ d }) => {
  const delta = d.totalFIRs - d.prevPeriodFIRs;
  const pct   = Math.round((delta / d.prevPeriodFIRs) * 100);
  return (
    <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: 6 }}>
        {d.stationCount} Police Stations · {d.activePatrols} Active Patrols
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
        <span><b>{d.totalFIRs.toLocaleString()}</b> FIRs</span>
        <span style={{ color: pct > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
          {pct > 0 ? '↑' : '↓'} {Math.abs(pct)}%
        </span>
      </div>
      {d.isAlertActive && (
        <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.3)', borderRadius: 4, fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
          ⚠ ACTIVE ALERT: {d.alertCategory} +{d.alertSpikePct}%
        </div>
      )}
      <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#888' }}>Click for full analysis</div>
    </div>
  );
};

// ─── Sub-component: District Drill-Down Panel ────────────────────────────────
const DrillDownPanel: React.FC<{
  district: District;
  onClose: () => void;
}> = ({ district: d, onClose }) => {
  const delta = d.totalFIRs - d.prevPeriodFIRs;
  const pct   = Math.round((delta / d.prevPeriodFIRs) * 100);
  const topCategory = Object.entries(d.crimesByCategory).sort((a, b) => b[1] - a[1])[0];
  const hourData = d.crimesByHour.map((count, i) => ({ hour: `${i}:00`, count }));

  const categoryData = Object.entries(d.crimesByCategory)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / d.totalFIRs) * 100) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="drill-down-panel" style={{
      width: '380px', minWidth: '380px',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        background: `linear-gradient(135deg, ${SEVERITY_FILL[d.severity]}, transparent)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <MapPin size={14} color={SEVERITY_COLOR[d.severity]} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: SEVERITY_COLOR[d.severity], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {d.severity} RISK
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{d.name}</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {d.stationCount} stations · {d.activePatrols} active patrols
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            borderRadius: '6px', padding: '0.3rem', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Alert banner */}
        {d.isAlertActive && (
          <div style={{
            marginTop: '0.75rem', padding: '0.5rem 0.75rem',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <div className="pulse-alert" style={{ width: 8, height: 8, background: '#dc2626', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
              ALERT: {d.alertCategory} spike of +{d.alertSpikePct}% detected at {d.alertDetectedAt}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
          {[
            { label: 'Total FIRs', value: d.totalFIRs.toLocaleString(), sub: 'This period' },
            {
              label: 'vs Prev Period', value: `${pct > 0 ? '+' : ''}${pct}%`,
              sub: `${delta > 0 ? '+' : ''}${delta} FIRs`,
              color: pct > 0 ? '#dc2626' : '#059669'
            },
            {
              label: 'Top Category', value: topCategory[0],
              sub: `${Math.round((topCategory[1] / d.totalFIRs) * 100)}% of total`,
              color: CATEGORY_COLOR[topCategory[0]]
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.65rem 0.75rem',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{item.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color || 'var(--text-primary)' }}>{item.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Weekly Trend Sparkline */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={13} /> 7-Day Trend
          </div>
          <div style={{ height: 90 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.weeklyTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={SEVERITY_COLOR[d.severity]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={SEVERITY_COLOR[d.severity]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 6, fontSize: 11 }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="count" stroke={SEVERITY_COLOR[d.severity]}
                  strokeWidth={2} fill={`url(#grad-${d.id})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Category Breakdown */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart2 size={13} /> Crime Category Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {categoryData.map(cat => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ fontSize: '0.78rem', color: CATEGORY_COLOR[cat.name], fontWeight: 600 }}>{cat.count} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({cat.pct}%)</span></span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${cat.pct}%`,
                    background: CATEGORY_COLOR[cat.name],
                    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Activity Distribution */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={13} /> 24-Hour Crime Distribution
          </div>
          <div style={{ height: 80 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }} barCategoryGap="15%">
                <XAxis dataKey="hour" tick={false} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 6, fontSize: 11 }}
                  formatter={(v: any) => [`${v} FIRs`, 'Activity']}
                />
                <Bar dataKey="count" fill="var(--accent-secondary)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {[0, 6, 12, 18, 23].map(h => (
              <span key={h} style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{TIME_LABELS[h]}</span>
            ))}
          </div>
        </div>

      </div>{/* /scrollable */}
    </div>
  );
};

// ─── Sub-component: Alerts Rail ──────────────────────────────────────────────
type AlertSort = 'severity' | 'spike' | 'time';
const AlertsRail: React.FC<{
  alerts: District[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ alerts, selectedId, onSelect }) => {
  const [sort, setSort] = useState<AlertSort>('severity');

  const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = useMemo(() => {
    const a = [...alerts];
    if (sort === 'severity') a.sort((x, y) => SEVERITY_ORDER[x.severity] - SEVERITY_ORDER[y.severity]);
    if (sort === 'spike')    a.sort((x, y) => (y.alertSpikePct ?? 0) - (x.alertSpikePct ?? 0));
    if (sort === 'time')     a.sort((x, y) => x.alertDetectedAt.localeCompare(y.alertDetectedAt));
    return a;
  }, [alerts, sort]);

  return (
    <div style={{
      width: '280px', minWidth: '280px',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      flexShrink: 0,
    }}>
      {/* Rail Header */}
      <div style={{ padding: '1rem 1.1rem 0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <Radio size={15} color="#dc2626" />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            Emerging Trend Alerts
          </span>
          <span style={{
            marginLeft: 'auto', background: '#dc2626', color: 'white',
            borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
            padding: '0.1rem 0.45rem', minWidth: 20, textAlign: 'center',
          }}>{alerts.length}</span>
        </div>
        {/* Sort selector */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {(['severity', 'spike', 'time'] as AlertSort[]).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              flex: 1, padding: '0.25rem 0',
              fontSize: '0.65rem', fontWeight: sort === s ? 700 : 400,
              background: sort === s ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: sort === s ? 'white' : 'var(--text-secondary)',
              border: 'none', borderRadius: 4, cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 0.15s ease',
            }}>
              {s === 'spike' ? 'Spike %' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '2rem 0' }}>
            No active alerts in current filter
          </div>
        )}
        {sorted.map((d, i) => {
          const isSelected = selectedId === d.id;
          return (
            <button key={d.id} onClick={() => onSelect(d.id)} className="alert-card-enter" style={{
              width: '100%', textAlign: 'left',
              background: isSelected ? `${SEVERITY_FILL[d.severity]}` : 'transparent',
              border: isSelected ? `1px solid ${SEVERITY_COLOR[d.severity]}` : '1px solid transparent',
              borderRadius: 8, padding: '0.75rem 0.85rem', cursor: 'pointer', marginBottom: '0.4rem',
              transition: 'all 0.15s ease',
              animationDelay: `${i * 0.06}s`,
            }}>
              {/* Alert header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {d.isAlertActive && (
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: SEVERITY_COLOR[d.severity],
                      animation: d.severity === 'critical' ? 'pulse-ring 1.5s infinite' : 'none',
                    }} />
                  )}
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</span>
                </div>
                <span className={`badge badge-${d.severity}`}>{d.severity}</span>
              </div>

              {/* Alert details */}
              {d.isAlertActive && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  <span style={{ color: CATEGORY_COLOR[d.alertCategory!] || 'var(--accent-primary)', fontWeight: 600 }}>
                    {d.alertCategory}
                  </span>
                  {' '}spike detected at {d.alertDetectedAt}
                </div>
              )}

              {/* Spike indicator */}
              {d.alertSpikePct !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={12} color={SEVERITY_COLOR[d.severity]} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: SEVERITY_COLOR[d.severity] }}>
                    +{d.alertSpikePct}%
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>vs 30-day avg</span>
                </div>
              )}

              {/* FIR count */}
              <div style={{ marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {d.totalFIRs.toLocaleString()} FIRs · {d.stationCount} stations
                </span>
                <ChevronRight size={12} color="var(--text-secondary)" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Rail footer */}
      <div style={{
        padding: '0.75rem 1.1rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.7rem', color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: '0.4rem'
      }}>
        <Activity size={11} />
        Updated every 15 minutes · SCRB Live Feed
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const GeoMap: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ── State
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [timeRange, setTimeRange]   = useState<TimeRange>('7d');
  const [category, setCategory]     = useState<CrimeCategory>('All');
  const [mapLayer, setMapLayer]     = useState<MapLayer>('hotspot');
  const [timeOfDay, setTimeOfDay]   = useState<number>(12);      // 0-23 slider
  const [showSlider, setShowSlider] = useState(false);
  const [mapCenter, setMapCenter]   = useState<[number, number]>([14.5, 76.5]);
  const [mapZoom, setMapZoom]       = useState(7);

  // ── Derived
  const filteredDistricts = useMemo(() => {
    return DISTRICTS.filter(d => {
      if (category !== 'All' && !(d.crimesByCategory[category] > 0)) return false;
      return true;
    });
  }, [category]);

  const alerts = useMemo(() => filteredDistricts.filter(d => d.isAlertActive), [filteredDistricts]);

  const totalFIRs      = useMemo(() => filteredDistricts.reduce((s, d) => s + d.totalFIRs, 0), [filteredDistricts]);
  const activeHotspots = useMemo(() => filteredDistricts.filter(d => d.severity === 'critical' || d.severity === 'high').length, [filteredDistricts]);
  const peakHour       = useMemo(() => {
    const sums = new Array(24).fill(0);
    filteredDistricts.forEach(d => d.crimesByHour.forEach((c, i) => { sums[i] += c; }));
    const peak = sums.indexOf(Math.max(...sums));
    return `${peak}:00 – ${peak + 1}:00`;
  }, [filteredDistricts]);
  const totalPatrols   = useMemo(() => filteredDistricts.reduce((s, d) => s + d.activePatrols, 0), [filteredDistricts]);

  // Hour-scaled radius
  const getRadius = useCallback((d: District) => {
    const base = mapLayer === 'hotspot'
      ? Math.sqrt(d.totalFIRs / 15)
      : Math.sqrt((d.crimesByCategory[category] || d.totalFIRs) / 10);
    const hourScale = showSlider
      ? (d.crimesByHour[timeOfDay] / Math.max(...d.crimesByHour)) * 0.8 + 0.4
      : 1;
    return Math.max(8, Math.min(45, base * hourScale));
  }, [mapLayer, category, showSlider, timeOfDay]);

  const getColor = useCallback((d: District) => {
    if (mapLayer === 'category' && category !== 'All') return CATEGORY_COLOR[category] || SEVERITY_COLOR[d.severity];
    return SEVERITY_COLOR[d.severity];
  }, [mapLayer, category]);

  const handleDistrictClick = useCallback((d: District) => {
    setSelectedDistrict(d);
    setMapCenter([d.lat, d.lng]);
    setMapZoom(10);
  }, []);

  const handleAlertSelect = useCallback((id: string) => {
    const d = DISTRICTS.find(x => x.id === id);
    if (d) handleDistrictClick(d);
  }, [handleDistrictClick]);

  const timeBracket = getTimeBracket(timeOfDay);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', gap: '0.75rem' }}>

      {/* ── Stats Ribbon ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', flexShrink: 0 }}>
        {[
          {
            icon: <AlertTriangle size={18} color="#dc2626" />,
            label: 'Active Hotspot Districts',
            value: activeHotspots,
            sub: `${alerts.length} with trend alerts`,
            color: '#dc2626',
          },
          {
            icon: <Shield size={18} color="var(--accent-secondary)" />,
            label: 'Total FIRs (Period)',
            value: totalFIRs.toLocaleString(),
            sub: `Across ${filteredDistricts.length} districts`,
            color: 'var(--accent-secondary)',
          },
          {
            icon: <Clock size={18} color="#7c3aed" />,
            label: 'Peak Crime Window',
            value: peakHour,
            sub: 'Aggregated all districts',
            color: '#7c3aed',
          },
          {
            icon: <Eye size={18} color="#059669" />,
            label: 'Active Patrols',
            value: totalPatrols,
            sub: 'Deployed field units',
            color: '#059669',
          },
        ].map((item, i) => (
          <div key={i} className="glass-panel" style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ padding: '0.55rem', background: `${item.color}18`, borderRadius: '8px', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{item.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="glass-panel" style={{
        padding: '0.65rem 1rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <Filter size={14} /> <span style={{ fontWeight: 600 }}>Filters:</span>
        </div>

        {/* Time Range */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {(['24h', '7d', '30d', '90d'] as TimeRange[]).map(t => (
            <button key={t} onClick={() => setTimeRange(t)} style={{
              padding: '0.3rem 0.7rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: timeRange === t ? 700 : 500,
              background: timeRange === t ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: timeRange === t ? 'white' : 'var(--text-secondary)',
              border: timeRange === t ? 'none' : '1px solid var(--border-color)',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}>{t}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />

        {/* Crime Category */}
        <select value={category} onChange={e => setCategory(e.target.value as CrimeCategory)} style={{
          background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
          border: '1px solid var(--border-color)', padding: '0.3rem 0.75rem',
          borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer',
        }}>
          {(['All', 'Theft', 'Assault', 'Fraud', 'Narcotics', 'Cyber', 'Burglary'] as CrimeCategory[]).map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Crime Types' : c}</option>
          ))}
        </select>

        <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />

        {/* Map Layer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
          <Layers size={14} />
        </div>
        {(['hotspot', 'category', 'patrol'] as MapLayer[]).map(l => (
          <button key={l} onClick={() => setMapLayer(l)} style={{
            padding: '0.3rem 0.7rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: mapLayer === l ? 700 : 500,
            background: mapLayer === l ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
            color: mapLayer === l ? 'white' : 'var(--text-secondary)',
            border: mapLayer === l ? 'none' : '1px solid var(--border-color)',
            cursor: 'pointer', transition: 'all 0.15s ease', textTransform: 'capitalize',
          }}>
            {l === 'hotspot' ? 'Hotspot Density' : l === 'category' ? 'By Category' : 'Patrol Coverage'}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />

        {/* Spatiotemporal toggle */}
        <button onClick={() => setShowSlider(s => !s)} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: showSlider ? 700 : 500,
          background: showSlider ? '#7c3aed' : 'var(--bg-tertiary)',
          color: showSlider ? 'white' : 'var(--text-secondary)',
          border: showSlider ? 'none' : '1px solid var(--border-color)',
          cursor: 'pointer', transition: 'all 0.15s ease',
        }}>
          <Clock size={13} /> Spatiotemporal
          <ChevronDown size={12} style={{ transform: showSlider ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {filteredDistricts.length} districts · Updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* ── Time-of-Day Slider (Spatiotemporal) ────────────────────────────── */}
      {showSlider && (
        <div className="glass-panel" style={{
          padding: '0.75rem 1.25rem', flexShrink: 0,
          background: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)',
          borderColor: 'rgba(124,58,237,0.2)',
          display: 'flex', alignItems: 'center', gap: '1.25rem',
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Time of Day Filter
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {String(timeOfDay).padStart(2, '0')}:00
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <input type="range" min={0} max={23} value={timeOfDay}
              onChange={e => setTimeOfDay(Number(e.target.value))}
              className="time-slider" style={{ accentColor: '#7c3aed' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[0, 6, 12, 18, 23].map(h => (
                <span key={h} style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{TIME_LABELS[h]}</span>
              ))}
            </div>
          </div>
          <div style={{
            flexShrink: 0, padding: '0.35rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
            background: `${timeBracket.color}18`, color: timeBracket.color,
            border: `1px solid ${timeBracket.color}40`,
          }}>
            {timeBracket.label}
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Crime Activity</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {filteredDistricts.reduce((s, d) => s + d.crimesByHour[timeOfDay], 0)} incidents/hr
            </div>
          </div>
        </div>
      )}

      {/* ── Main Map Area ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, gap: 0, border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={[14.5, 76.5]} zoom={7}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <MapRecenter center={mapCenter} zoom={mapZoom} />
            <TileLayer
              key={theme}
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url={isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
            />

            {/* District markers */}
            {filteredDistricts.map(d => {
              const isSelected = selectedDistrict?.id === d.id;
              const color = getColor(d);
              const r     = getRadius(d);
              return (
                <React.Fragment key={d.id}>
                  {/* Alert pulsing outer ring */}
                  {d.isAlertActive && (
                    <CircleMarker
                      center={[d.lat, d.lng]}
                      radius={r + (d.severity === 'critical' ? 14 : 9)}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.08,
                        weight: d.severity === 'critical' ? 2.5 : 1.5,
                        dashArray: d.severity === 'critical' ? '4 4' : '3 5',
                        className: 'leaflet-alert-ring',
                      }}
                      eventHandlers={{ click: () => handleDistrictClick(d) }}
                    />
                  )}

                  {/* Main district circle */}
                  <CircleMarker
                    center={[d.lat, d.lng]}
                    radius={r}
                    pathOptions={{
                      color: isSelected ? 'white' : color,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.85 : 0.5,
                      weight: isSelected ? 3 : 1.5,
                    }}
                    eventHandlers={{ click: () => handleDistrictClick(d) }}
                  >
                    <Popup>
                      <DistrictPopup d={d} />
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* Map Legend */}
          <div className="map-legend">
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
              {mapLayer === 'category' && category !== 'All' ? `${category} Density` : 'Risk Level'}
            </div>
            {mapLayer === 'category' && category !== 'All'
              ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: CATEGORY_COLOR[category], opacity: 0.6 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{category}</span>
                </div>
              )
              : (['critical', 'high', 'medium', 'low'] as Severity[]).map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: SEVERITY_COLOR[s] }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{s}</span>
                </div>
              ))
            }
            {showSlider && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.68rem', color: '#7c3aed' }}>
                ⏱ Filtered: {String(timeOfDay).padStart(2,'0')}:00
              </div>
            )}
          </div>
        </div>

        {/* Drill-down panel (slides in on district click) */}
        {selectedDistrict && (
          <DrillDownPanel
            district={selectedDistrict}
            onClose={() => { setSelectedDistrict(null); setMapCenter([14.5, 76.5]); setMapZoom(7); }}
          />
        )}

        {/* Alerts Rail */}
        <AlertsRail
          alerts={alerts}
          selectedId={selectedDistrict?.id ?? null}
          onSelect={handleAlertSelect}
        />
      </div>
    </div>
  );
};
