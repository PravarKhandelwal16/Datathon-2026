import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const mockRiskData = [
  { subject: 'Violent Crime', A: 80, fullMark: 100 },
  { subject: 'Property Crime', A: 65, fullMark: 100 },
  { subject: 'Cyber Fraud', A: 45, fullMark: 100 },
  { subject: 'Traffic Violations', A: 90, fullMark: 100 },
  { subject: 'Narcotics', A: 30, fullMark: 100 },
];

const mockAnomalyData = [
  { time: '00:00', value: 10 },
  { time: '04:00', value: 8 },
  { time: '08:00', value: 45 },
  { time: '12:00', value: 60 },
  { time: '16:00', value: 55 },
  { time: '20:00', value: 110 }, // Anomaly spike
  { time: '24:00', value: 20 },
];

export const PredictiveInsights: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: 'calc(100vh - 8rem)' }}>
      
      {/* Risk Scoring Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: 0, marginBottom: '1.5rem' }}>Regional Risk Profile</h2>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockRiskData}>
              <PolarGrid stroke="var(--glass-border)" />
              <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--glass-border)" tick={{fill: 'var(--text-secondary)'}} />
              <Radar name="Risk Score" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Detection Panel */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: 0, marginBottom: '1.5rem' }}>Time-Series Anomaly Detection</h2>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockAnomalyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--glass-border)', borderRadius: '8px' }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="var(--warning)" 
                strokeWidth={3}
                dot={{ r: 5, fill: 'var(--warning)', stroke: 'var(--bg-primary)' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--danger-glow)', borderRadius: '8px', border: '1px solid var(--danger)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Anomaly Detected</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Unusual spike in activity recorded at 20:00 (Confidence: 94%)</div>
        </div>
      </div>

    </div>
  );
};
