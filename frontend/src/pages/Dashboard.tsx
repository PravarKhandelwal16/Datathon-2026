import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
  AlertTriangle, TrendingUp, Users, MapPin,
  ArrowUpRight, ArrowDownRight, Clock, Activity,
  Sliders
} from 'lucide-react';

// ─── Constants & Styling ──────────────────────────────────────────────────────
const C = {
  red: '#dc2626',
  orange: '#ea580c',
  amber: '#d97706',
  green: '#059669',
  blue: '#0284c7',
  violet: '#7c3aed',
};

const TT: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary)',
  borderColor: 'var(--border-color)',
  borderRadius: '8px',
  fontSize: '0.78rem',
  color: 'var(--text-primary)',
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockTrendDaily = {
  all: [
    { name: 'Mon', crimes: 45, clearance: 32 },
    { name: 'Tue', crimes: 52, clearance: 38 },
    { name: 'Wed', crimes: 38, clearance: 28 },
    { name: 'Thu', crimes: 65, clearance: 42 },
    { name: 'Fri', crimes: 85, clearance: 58 },
    { name: 'Sat', crimes: 110, clearance: 72 },
    { name: 'Sun', crimes: 95, clearance: 64 },
  ],
  bng: [
    { name: 'Mon', crimes: 25, clearance: 18 },
    { name: 'Tue', crimes: 30, clearance: 22 },
    { name: 'Wed', crimes: 20, clearance: 15 },
    { name: 'Thu', crimes: 38, clearance: 24 },
    { name: 'Fri', crimes: 50, clearance: 35 },
    { name: 'Sat', crimes: 68, clearance: 48 },
    { name: 'Sun', crimes: 55, clearance: 38 },
  ],
  mys: [
    { name: 'Mon', crimes: 12, clearance: 8 },
    { name: 'Tue', crimes: 14, clearance: 10 },
    { name: 'Wed', crimes: 10, clearance: 8 },
    { name: 'Thu', crimes: 18, clearance: 12 },
    { name: 'Fri', crimes: 22, clearance: 16 },
    { name: 'Sat', crimes: 28, clearance: 18 },
    { name: 'Sun', crimes: 24, clearance: 15 },
  ],
};

const mockCategories = {
  all: [
    { name: 'Theft', count: 120, color: C.red },
    { name: 'Assault', count: 85, color: C.orange },
    { name: 'Fraud', count: 45, color: C.amber },
    { name: 'Narcotics', count: 35, color: C.violet },
    { name: 'Cyber', count: 58, color: C.blue },
  ],
  bng: [
    { name: 'Theft', count: 70, color: C.red },
    { name: 'Assault', count: 42, color: C.orange },
    { name: 'Fraud', count: 28, color: C.amber },
    { name: 'Narcotics', count: 18, color: C.violet },
    { name: 'Cyber', count: 45, color: C.blue },
  ],
  mys: [
    { name: 'Theft', count: 32, color: C.red },
    { name: 'Assault', count: 28, color: C.orange },
    { name: 'Fraud', count: 12, color: C.amber },
    { name: 'Narcotics', count: 9, color: C.violet },
    { name: 'Cyber', count: 8, color: C.blue },
  ],
};

const districtShare = [
  { name: 'Bengaluru Urban', value: 48, color: C.red },
  { name: 'Mysuru', value: 18, color: C.orange },
  { name: 'Kalaburagi', value: 14, color: C.amber },
  { name: 'Hubballi-Dharwad', value: 12, color: C.blue },
  { name: 'Others', value: 8, color: C.green },
];

const priorityAlerts = [
  { id: '1', time: '10 mins ago', district: 'Bengaluru Urban', msg: 'Spike in Chain Snatching activity near Majestic (Confidence 97%)', severity: 'critical' },
  { id: '2', time: '45 mins ago', district: 'Mysuru', msg: 'Cluster of Vehicle Thefts reported near City Market area', severity: 'high' },
  { id: '3', time: '2 hours ago', district: 'Kalaburagi', msg: 'Cross-border drug courier movement anomaly detected on NH-150A', severity: 'high' },
  { id: '4', time: '3 hours ago', district: 'Bengaluru Urban', msg: 'ATM Fraud pattern flagged targeting IT park employees', severity: 'medium' },
];

const activeDispatches = [
  { id: 'D10', unit: 'Patrol 14 (Majestic)', status: 'On Route', destination: 'KSR Majestic Bus Stand', eta: '3 mins' },
  { id: 'D12', unit: 'Interceptor 3 (Koramangala)', status: 'Responding', destination: '80 Feet Rd Junction', eta: '5 mins' },
  { id: 'D15', unit: 'Patrol 9 (Mysuru Market)', status: 'On Scene', destination: 'Devaraja Market', eta: 'Active' },
  { id: 'D18', unit: 'Cyber Response Unit 2', status: 'Investigating', destination: 'Digital Fraud Center', eta: 'N/A' },
];

export const Dashboard: React.FC = () => {
  const [district, setDistrict] = useState<'all' | 'bng' | 'mys'>('all');

  const trendData = mockTrendDaily[district];
  const catData = mockCategories[district];

  // Dynamic values depending on filter
  const stats = {
    all: { incidents: '342', riskZones: '14', repeatOffenders: '89', clearance: '68%' },
    bng: { incidents: '205', riskZones: '8', repeatOffenders: '52', clearance: '71%' },
    mys: { incidents: '97', riskZones: '4', repeatOffenders: '24', clearance: '64%' },
  }[district];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      
      {/* ─── Control Bar ──────────────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={15} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Region Filter:</span>
          {(['all', 'bng', 'mys'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDistrict(d)}
              className={`network-tab${district === d ? ' active' : ''}`}
              style={{ textTransform: 'capitalize', padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
            >
              {d === 'all' ? 'All Districts' : d === 'bng' ? 'Bengaluru' : 'Mysuru'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <Clock size={12} />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* ─── KPI Cards ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <KpiCard
          title="Active Incidents"
          value={stats.incidents}
          icon={<AlertTriangle size={20} color="var(--danger)" />}
          trend="+12% vs last week"
          trendDir="up"
          sparkData={[30, 42, 38, 55, 68, 85, 78]}
          color={C.red}
        />
        <KpiCard
          title="High Risk Hotspots"
          value={stats.riskZones}
          icon={<MapPin size={20} color="var(--warning)" />}
          trend="3 new flags detected"
          trendDir="up"
          sparkData={[5, 7, 6, 8, 11, 14, 13]}
          color={C.amber}
        />
        <KpiCard
          title="Repeat Offenders Flagged"
          value={stats.repeatOffenders}
          icon={<Users size={20} color="var(--accent-primary)" />}
          trend="Cross-jurisdiction matches"
          trendDir="stable"
          sparkData={[75, 78, 80, 84, 86, 89, 88]}
          color={C.violet}
        />
        <KpiCard
          title="Clearance Rate"
          value={stats.clearance}
          icon={<TrendingUp size={20} color="var(--success)" />}
          trend="+5.2% improvement"
          trendDir="up"
          sparkData={[60, 62, 61, 64, 66, 68, 68]}
          color={C.green}
        />
      </div>

      {/* ─── Core Analytical Section ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', flexWrap: 'wrap' }}>
        
        {/* Crime Trend Chart */}
        <div className="glass-panel" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Crime Volume & Clearance Trend</h3>
              <p style={{ margin: 0, fontSize: '0.72rem' }}>7-day volume compared to resolved cases</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-primary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Incidents</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: C.green }} />
                <span style={{ color: 'var(--text-secondary)' }}>Clearances</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClearance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)', fontSize: 10}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)', fontSize: 10}} />
                <Tooltip 
                  contentStyle={TT}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="crimes" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" name="Incidents" />
                <Area type="monotone" dataKey="clearance" stroke={C.green} strokeWidth={2} fillOpacity={1} fill="url(#colorClearance)" name="Clearances" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Chart */}
        <div className="glass-panel" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Top Crime Categories</h3>
            <p style={{ margin: 0, fontSize: '0.72rem', marginBottom: '1.25rem' }}>Primary distribution for active district</p>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 5 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-secondary)" tick={{fontSize: 9}} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" tick={{fontSize: 10}} width={65} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-tertiary)'}}
                  contentStyle={TT}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── Bottom Section: Live Activity Command Center ────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* District Share / Pie Chart */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>District Crime Contribution</h3>
            <p style={{ margin: 0, fontSize: '0.72rem', marginBottom: '1rem' }}>Percentage breakdown of active reports</p>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '130px', height: '130px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={districtShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {districtShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              {districtShare.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Priority Alerts */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Strategic Priority Alerts</h3>
              <p style={{ margin: 0, fontSize: '0.72rem' }}>AI-detected anomalies requiring dispatch</p>
            </div>
            <span style={{ background: 'rgba(220,38,38,0.12)', color: C.red, padding: '0.15rem 0.5rem', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700 }}>
              4 Active
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto' }}>
            {priorityAlerts.map(alert => (
              <div key={alert.id} style={{ display: 'flex', gap: '0.6rem', padding: '0.55rem 0.65rem', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <div style={{ marginTop: 2 }}>
                  {alert.severity === 'critical' ? (
                    <div className="pulse-ring" style={{ width: 10, height: 10, background: C.red }} />
                  ) : (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: alert.severity === 'high' ? C.orange : C.amber }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: alert.severity === 'critical' ? C.red : 'inherit' }}>{alert.district}</span>
                    <span>{alert.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{alert.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Dispatches */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Patrol Dispatch Status</h3>
            <p style={{ margin: 0, fontSize: '0.72rem', marginBottom: '1rem' }}>Real-time status of responding units</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
            {activeDispatches.map(d => {
              const statusColor = d.status === 'On Scene' ? C.green : d.status === 'Responding' ? C.orange : d.status === 'On Route' ? C.blue : 'var(--text-secondary)';
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.65rem', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '0.74rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.unit}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>Dest: {d.destination}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 600, color: statusColor }}>{d.status}</span>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>ETA: {d.eta}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

// ─── Sparkline / Trend Card Sub-component ─────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendDir: 'up' | 'down' | 'stable';
  sparkData: number[];
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, trendDir, sparkData, color }) => {
  // Format spark data to object shape for Recharts
  const chartData = sparkData.map((val, i) => ({ index: i, val }));

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>{title}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        </div>
        <div style={{ padding: '0.4rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          {icon}
        </div>
      </div>

      {/* Mini Trend / Sparkline */}
      <div style={{ height: '32px', width: '100%', marginTop: '0.2rem', marginBottom: '0.1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="val" stroke={color} strokeWidth={1.5} fill={`url(#grad-${title})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        <span>{trend}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: trendDir === 'up' ? C.orange : trendDir === 'down' ? C.green : 'var(--text-secondary)' }}>
          {trendDir === 'up' && <ArrowUpRight size={13} />}
          {trendDir === 'down' && <ArrowDownRight size={13} />}
          {trendDir === 'stable' && <Activity size={12} />}
        </div>
      </div>
    </div>
  );
};
