import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingUp, Users, MapPin } from 'lucide-react';

const mockTrendData = [
  { name: 'Mon', crimes: 45 },
  { name: 'Tue', crimes: 52 },
  { name: 'Wed', crimes: 38 },
  { name: 'Thu', crimes: 65 },
  { name: 'Fri', crimes: 85 },
  { name: 'Sat', crimes: 110 },
  { name: 'Sun', crimes: 95 },
];

const mockCategoryData = [
  { name: 'Theft', count: 120 },
  { name: 'Assault', count: 85 },
  { name: 'Fraud', count: 45 },
  { name: 'Burglary', count: 30 },
];

export const Dashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <KpiCard title="Active Incidents" value="342" icon={<AlertTriangle size={24} color="var(--danger)" />} trend="+12% from last week" />
        <KpiCard title="High Risk Zones" value="14" icon={<MapPin size={24} color="var(--warning)" />} trend="3 new hotspots detected" />
        <KpiCard title="Repeat Offenders Flagged" value="89" icon={<Users size={24} color="var(--accent-primary)" />} trend="Cross-jurisdiction matches" />
        <KpiCard title="Clearance Rate" value="68%" icon={<TrendingUp size={24} color="var(--success)" />} trend="+5% improvement" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>7-Day Crime Volume Trend</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCrimes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="crimes" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorCrimes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Top Categories</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategoryData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-secondary)" />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" />
                <Tooltip 
                  cursor={{fill: 'var(--bg-tertiary)'}}
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="var(--accent-secondary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string }> = ({ title, value, icon, trend }) => (
  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      </div>
      <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
      {trend}
    </div>
  </div>
);
