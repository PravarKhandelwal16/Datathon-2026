import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Layers, Filter, ChevronRight, X, Activity,
  Radio, Shield, Eye, BarChart2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

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
  name: string;
  lat: number;
  lng: number;
  firs: number;
  severity: Severity;
  alerts: boolean;
  stations: number;
  patrols: number;
  trend: number;
}

// ─── Constants & Styling ──────────────────────────────────────────────────────
const SEVERITY_COLOR: Record<Severity, string> = {
  low:      '#059669', // Emerald
  medium:   '#d97706', // Amber
  high:     '#ea580c', // Orange
  critical: '#dc2626', // Red
};
const SEVERITY_FILL: Record<Severity, string> = {
  low:      'rgba(5,150,105,0.06)',
  medium:   'rgba(217,119,6,0.06)',
  high:     'rgba(234,88,12,0.06)',
  critical: 'rgba(220,38,38,0.06)',
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
  return (
    <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: 6 }}>
        {d.stations} Police Stations · {d.patrols} Active Patrols
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
        <span><b>{d.firs.toLocaleString()}</b> FIRs</span>
        <span style={{ color: d.trend >= 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
          {d.trend >= 0 ? '↑' : '↓'} {Math.abs(d.trend)}%
        </span>
      </div>
      {d.alerts && (
        <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.3)', borderRadius: 4, fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
          ⚠ ACTIVE ALERTS DETECTED
        </div>
      )}
      <div style={{ marginTop: 6, fontSize: '0.72rem', color: '#888' }}>Click for full analysis</div>
    </div>
  );
};

// ─── Sub-component: District Drill-Down Panel ────────────────────────────────
const DrillDownPanel: React.FC<{
  data: any;
  severity: Severity;
  onClose: () => void;
}> = ({ data: d, severity, onClose }) => {
  const pct = parseInt(d.delta.replace('%', ''));
  const hourData = d.hours;
  const categoryData = d.categories.map((c: any) => ({
    name: c.category,
    count: Math.round(d.firs * (c.pct / 100)),
    pct: c.pct
  }));

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
        background: `linear-gradient(135deg, ${SEVERITY_FILL[severity]}, transparent)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <MapPin size={14} color={SEVERITY_COLOR[severity]} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: SEVERITY_COLOR[severity], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {severity} RISK
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{d.district}</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {d.stations} stations · {d.patrols} active patrols
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
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
          {[
            { label: 'Total FIRs', value: d.firs.toLocaleString(), sub: 'This period' },
            {
              label: 'vs Prev Period', value: d.delta,
              sub: 'Historical relative',
              color: pct > 0 ? '#dc2626' : '#059669'
            },
            {
              label: 'Top Category', value: d.topCategory.split(' ')[0],
              sub: 'Primary head',
              color: CATEGORY_COLOR[d.topCategory.split(' ')[0]] || 'var(--accent-primary)'
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.65rem 0.75rem',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color || 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
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
              <AreaChart data={d.trend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${d.district}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={SEVERITY_COLOR[severity]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={SEVERITY_COLOR[severity]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: 6, fontSize: 11 }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="firs" stroke={SEVERITY_COLOR[severity]}
                  strokeWidth={2} fill={`url(#grad-${d.district})`} dot={false} name="FIRs" />
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
            {categoryData.map((cat: any) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>{cat.name}</span>
                  <span style={{ fontSize: '0.78rem', color: CATEGORY_COLOR[cat.name] || 'var(--accent-primary)', fontWeight: 600 }}>{cat.count} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({cat.pct}%)</span></span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${cat.pct}%`,
                    background: CATEGORY_COLOR[cat.name] || 'var(--accent-primary)',
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
      </div>
    </div>
  );
};

// ─── Sub-component: Alerts Rail ──────────────────────────────────────────────
type AlertSort = 'severity' | 'spike' | 'time';
const AlertsRail: React.FC<{
  alerts: District[];
  selectedName: string | null;
  onSelect: (name: string) => void;
}> = ({ alerts, selectedName, onSelect }) => {
  const [sort, setSort] = useState<AlertSort>('severity');

  const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = useMemo(() => {
    const a = [...alerts];
    if (sort === 'severity') a.sort((x, y) => SEVERITY_ORDER[x.severity] - SEVERITY_ORDER[y.severity]);
    if (sort === 'spike')    a.sort((x, y) => y.trend - x.trend);
    if (sort === 'time')     a.sort((x, y) => x.name.localeCompare(y.name));
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
          const isSelected = selectedName === d.name;
          return (
            <button key={d.name} onClick={() => onSelect(d.name)} className="alert-card-enter" style={{
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
                  {d.alerts && (
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

              {/* Spike indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={12} color={SEVERITY_COLOR[d.severity]} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: SEVERITY_COLOR[d.severity] }}>
                  +{Math.abs(d.trend)}%
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>vs 30-day avg</span>
              </div>

              {/* FIR count */}
              <div style={{ marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {d.firs.toLocaleString()} FIRs · {d.stations} stations
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
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);
  const [drilldownData, setDrilldownData] = useState<any | null>(null);
  const [timeRange, setTimeRange]   = useState<TimeRange>('7d');
  const [category, setCategory]     = useState<CrimeCategory>('All');
  const [mapLayer, setMapLayer]     = useState<MapLayer>('hotspot');
  const [timeOfDay, setTimeOfDay]   = useState<number>(12);      // 0-23 slider
  const [showSlider, setShowSlider] = useState(false);
  const [mapCenter, setMapCenter]   = useState<[number, number]>([14.5, 76.5]);
  const [mapZoom, setMapZoom]       = useState(7);
  const [loading, setLoading]       = useState(true);

  // Fetch districts on filter update
  useEffect(() => {
    async function loadDistricts() {
      try {
        setLoading(true);
        const res = await api.getMapDistricts(category, showSlider ? timeOfDay : null);
        const mapped = res.map(d => ({
          ...d,
          severity: d.severity as Severity
        }));
        setDistricts(mapped);
      } catch (err) {
        console.error("Map districts loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDistricts();
  }, [category, timeOfDay, showSlider]);

  // Fetch drilldown payload on selection
  useEffect(() => {
    async function loadDrilldown() {
      if (!selectedDistrictName) {
        setDrilldownData(null);
        return;
      }
      try {
        const res = await api.getMapDrilldown(selectedDistrictName);
        setDrilldownData(res);
      } catch (err) {
        console.error("Map drilldown loading error:", err);
      }
    }
    loadDrilldown();
  }, [selectedDistrictName]);

  // Derived summaries
  const alerts = useMemo(() => districts.filter(d => d.alerts), [districts]);
  const totalFIRs      = useMemo(() => districts.reduce((s, d) => s + d.firs, 0), [districts]);
  const activeHotspots = useMemo(() => districts.filter(d => d.severity === 'critical' || d.severity === 'high').length, [districts]);
  const totalPatrols   = useMemo(() => districts.reduce((s, d) => s + d.patrols, 0), [districts]);

  // Hour-scaled radius
  const getRadius = useCallback((d: District) => {
    const base = Math.sqrt(d.firs / 1.5);
    return Math.max(8, Math.min(45, base));
  }, []);

  const getColor = useCallback((d: District) => {
    if (mapLayer === 'category' && category !== 'All') return CATEGORY_COLOR[category] || SEVERITY_COLOR[d.severity];
    return SEVERITY_COLOR[d.severity];
  }, [mapLayer, category]);

  const handleDistrictClick = useCallback((d: District) => {
    setSelectedDistrictName(d.name);
    setMapCenter([d.lat, d.lng]);
    setMapZoom(10);
  }, []);

  const handleAlertSelect = useCallback((name: string) => {
    const d = districts.find(x => x.name === name);
    if (d) handleDistrictClick(d);
  }, [districts, handleDistrictClick]);

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
            value: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {activeHotspots}
                {loading && <span className="pulse-alert" style={{ width: 8, height: 8, background: '#dc2626', display: 'inline-block' }} />}
              </span>
            ),
            sub: `${alerts.length} with trend alerts`,
            color: '#dc2626',
          },
          {
            icon: <Shield size={18} color="var(--accent-secondary)" />,
            label: 'Total FIRs (Period)',
            value: totalFIRs.toLocaleString(),
            sub: `Across ${districts.length} districts`,
            color: 'var(--accent-secondary)',
          },
          {
            icon: <Clock size={18} color="#7c3aed" />,
            label: 'Active Hour Frame',
            value: showSlider ? `${timeOfDay}:00` : 'Rolling 24h',
            sub: showSlider ? timeBracket.label : 'Continuous scan',
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
              border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.15s ease',
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 16, background: 'var(--border-color)' }} />

        {/* Crime Category */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value as CrimeCategory)}
          style={{
            padding: '0.3rem 0.5rem', background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)', border: '1px solid var(--border-color)',
            borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', outline: 'none',
          }}
        >
          {['All', 'Theft', 'Assault', 'Fraud', 'Narcotics', 'Cyber', 'Burglary'].map(cat => (
            <option key={cat} value={cat}>{cat} (Category)</option>
          ))}
        </select>

        {/* Map Layers */}
        <div style={{ display: 'flex', gap: '0.3rem', marginLeft: 'auto' }}>
          {[
            { id: 'hotspot', label: 'Hotspots', icon: <Radio size={12} /> },
            { id: 'category', label: 'By Category', icon: <Layers size={12} /> },
            { id: 'patrol', label: 'Patrol Coverage', icon: <Shield size={12} /> },
          ].map(layer => (
            <button key={layer.id} onClick={() => setMapLayer(layer.id as MapLayer)} style={{
              padding: '0.3rem 0.7rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: mapLayer === layer.id ? 700 : 500,
              background: mapLayer === layer.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: mapLayer === layer.id ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              {layer.icon} {layer.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowSlider(!showSlider)}
          style={{
            padding: '0.3rem 0.7rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: showSlider ? 700 : 500,
            background: showSlider ? 'rgba(124,58,237,0.15)' : 'var(--bg-tertiary)',
            color: showSlider ? '#7c3aed' : 'var(--text-secondary)',
            border: `1px solid ${showSlider ? 'rgba(124,58,237,0.3)' : 'var(--border-color)'}`,
            cursor: 'pointer', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          <Clock size={12} /> Spatiotemporal (Hour Slider)
        </button>
      </div>

      {/* ── Spatiotemporal Hour Slider Panel ───────────────────────────────── */}
      {showSlider && (
        <div className="glass-panel slide-in-top" style={{
          padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.3rem', minWidth: 100 }}>
            ⏱ Hour: {String(timeOfDay).padStart(2,'0')}:00
          </span>
          <input
            type="range" min="0" max="23" value={timeOfDay}
            onChange={e => setTimeOfDay(parseInt(e.target.value))}
            style={{
              flex: 1, accentColor: '#7c3aed', cursor: 'pointer', height: 4,
              borderRadius: 2, background: 'var(--border-color)', outline: 'none',
            }}
          />
          <span style={{
            fontSize: '0.74rem', fontWeight: 600, color: timeBracket.color,
            background: `${timeBracket.color}15`, padding: '0.2rem 0.5rem', borderRadius: 4,
            minWidth: 120, textAlign: 'center',
          }}>
            {timeBracket.label}
          </span>
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
            {districts.map(d => {
              const isSelected = selectedDistrictName === d.name;
              const color = getColor(d);
              const r     = getRadius(d);
              return (
                <React.Fragment key={d.name}>
                  {/* Alert pulsing outer ring */}
                  {d.alerts && (
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
        {selectedDistrictName && drilldownData && (
          <DrillDownPanel
            data={drilldownData}
            severity={districts.find(d => d.name === selectedDistrictName)?.severity || 'low'}
            onClose={() => { setSelectedDistrictName(null); setMapCenter([14.5, 76.5]); setMapZoom(7); }}
          />
        )}

        {/* Alerts Rail */}
        <AlertsRail
          alerts={alerts}
          selectedName={selectedDistrictName}
          onSelect={handleAlertSelect}
        />
      </div>
    </div>
  );
};
