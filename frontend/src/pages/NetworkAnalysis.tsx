import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
  Search, Filter, Users, MapPin, Fingerprint,
  AlertTriangle, X, Link2, Eye, GitBranch,
  Shield, Hash, Crosshair, Network
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type NodeGroup = 'suspect' | 'victim' | 'location' | 'case' | 'vehicle' | 'organization';
type LinkType  = 'accused_in' | 'victim_in' | 'occurred_at' | 'linked_case' | 'derived_mo' | 'associate' | 'uses_vehicle' | 'member_of';

interface CrimeNode {
  id: string;
  name: string;
  group: NodeGroup;
  val: number;
  // suspects / victims
  age?: number;
  dob?: string;
  address?: string;
  district?: string;
  priorConvictions?: number;
  firs?: string[];
  moTags?: string[];
  riskScore?: number;
  jurisdictions?: string[];
  // cases
  firNo?: string;
  ipcSections?: string[];
  date?: string;
  status?: string;
  // locations
  locationType?: string;
  crimeCount?: number;
  // vehicles
  regNo?: string;
  vehicleType?: string;
  // org
  orgType?: string;
  members?: number;
}

interface CrimeLink {
  source: string;
  target: string;
  type: LinkType;
  label?: string;
  strength?: number; // 1-3
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_COLORS: Record<NodeGroup, string> = {
  suspect:      '#dc2626',
  victim:       '#059669',
  location:     '#d97706',
  case:         '#0284c7',
  vehicle:      '#7c3aed',
  organization: '#db2777',
};
const NODE_ICONS: Record<NodeGroup, string> = {
  suspect:      '⚠',
  victim:       '◎',
  location:     '⬡',
  case:         '◈',
  vehicle:      '▲',
  organization: '◆',
};
const LINK_COLORS: Record<LinkType, string> = {
  accused_in:   '#dc2626',
  victim_in:    '#059669',
  occurred_at:  '#d97706',
  linked_case:  '#0284c7',
  derived_mo:   '#f43f5e',
  associate:    '#7c3aed',
  uses_vehicle: '#9333ea',
  member_of:    '#db2777',
};
const LINK_LABELS: Record<LinkType, string> = {
  accused_in:   'Accused In',
  victim_in:    'Victim In',
  occurred_at:  'Occurred At',
  linked_case:  'Linked Case',
  derived_mo:   'Same MO',
  associate:    'Associate',
  uses_vehicle: 'Uses Vehicle',
  member_of:    'Member Of',
};
const MO_COLORS: Record<string, string> = {
  'Chain Snatching': '#dc2626',
  'Vehicle Theft':   '#ea580c',
  'Pickpocket':      '#d97706',
  'House Breaking':  '#7c3aed',
  'ATM Fraud':       '#0284c7',
  'Land Grab':       '#db2777',
  'Extortion':       '#991b1b',
  'Narcotics':       '#6d28d9',
};

// ─── Sub: Entity Detail Panel ─────────────────────────────────────────────────
const EntityDetailPanel: React.FC<{
  node: CrimeNode;
  allNodes: CrimeNode[];
  allLinks: CrimeLink[];
  onClose: () => void;
}> = ({ node, allNodes, allLinks, onClose }) => {
  const color = NODE_COLORS[node.group];
  const isSuspect = node.group === 'suspect';

  const connections = useMemo(() => {
    return allLinks.filter(l => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return srcId === node.id || tgtId === node.id;
    });
  }, [node.id, allLinks]);

  const moRadarData = node.moTags?.map(tag => ({ tag, score: Math.floor(Math.random() * 40 + 60) })) ?? [];

  return (
    <div className="entity-detail-panel" style={{
      width: 360, minWidth: 360, flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.1rem 1.25rem 0.9rem',
        borderBottom: '1px solid var(--border-color)',
        background: `linear-gradient(135deg, ${color}12, transparent)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: `${color}22`, border: `2px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              {NODE_ICONS[node.group]}
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                {node.group}
              </div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{node.name}</h3>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            borderRadius: 6, padding: '0.3rem', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
          }}>
            <X size={15} />
          </button>
        </div>

        {/* Risk score bar for suspects */}
        {isSuspect && node.riskScore !== undefined && (
          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Risk Score</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: node.riskScore >= 85 ? '#dc2626' : node.riskScore >= 65 ? '#ea580c' : '#d97706' }}>
                {node.riskScore}/100
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${node.riskScore}%`,
                background: node.riskScore >= 85 ? '#dc2626' : node.riskScore >= 65 ? '#ea580c' : '#d97706',
                transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* Core details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {[
            node.age       && { label: 'Age',          value: `${node.age} yrs` },
            node.dob       && { label: 'DOB',           value: node.dob },
            node.district  && { label: 'District',      value: node.district },
            node.address   && { label: 'Address',       value: node.address },
            node.firNo     && { label: 'FIR Number',    value: node.firNo },
            node.date      && { label: 'Date Filed',    value: node.date },
            node.status    && { label: 'Status',        value: node.status },
            node.locationType  && { label: 'Type',       value: node.locationType },
            node.crimeCount !== undefined && { label: 'Crime Count', value: node.crimeCount },
            node.regNo     && { label: 'Reg. Number',   value: node.regNo },
            node.vehicleType && { label: 'Vehicle Type', value: node.vehicleType },
            node.orgType   && { label: 'Org. Type',     value: node.orgType },
            node.members !== undefined && { label: 'Members',  value: node.members },
            node.priorConvictions !== undefined && { label: 'Convictions', value: node.priorConvictions },
          ].filter(Boolean).map((item: any, i) => (
            <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 6, padding: '0.5rem 0.6rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* IPC sections */}
        {node.ipcSections && node.ipcSections.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>IPC Sections</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {node.ipcSections.map(s => (
                <span key={s} style={{ padding: '0.2rem 0.55rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(2,132,199,0.12)', color: '#0284c7', border: '1px solid rgba(2,132,199,0.3)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Modus Operandi */}
        {node.moTags && node.moTags.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Fingerprint size={12} /> Modus Operandi
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {node.moTags.map(tag => (
                <span key={tag} className="mo-chip" style={{ fontSize: '0.65rem', background: `${MO_COLORS[tag] ?? '#6b7280'}15`, color: MO_COLORS[tag] ?? '#6b7280', border: `1px solid ${MO_COLORS[tag] ?? '#6b7280'}30` }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Jurisdictions */}
        {node.jurisdictions && node.jurisdictions.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={12} /> Active Jurisdictions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {node.jurisdictions.map(j => (
                <span key={j} style={{ padding: '0.2rem 0.55rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  📍 {j}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Linked FIRs */}
        {node.firs && node.firs.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Hash size={12} /> Linked FIRs ({node.firs.length})
            </div>
            {node.firs.map(fir => (
              <div key={fir} style={{ padding: '0.35rem 0.6rem', borderRadius: 5, fontSize: '0.75rem', fontWeight: 500, color: '#0284c7', background: 'rgba(2,132,199,0.06)', border: '1px solid rgba(2,132,199,0.2)', marginBottom: '0.25rem' }}>
                {fir}
              </div>
            ))}
          </div>
        )}

        {/* Network connections */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link2 size={12} /> Network Connections ({connections.length})
          </div>
          {connections.slice(0, 6).map((l, i) => {
            const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
            const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
            const otherId = srcId === node.id ? tgtId : srcId;
            const other   = allNodes.find(n => n.id === otherId);
            if (!other) return null;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.4rem 0.5rem', borderRadius: 5, marginBottom: '0.25rem',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: NODE_COLORS[other.group], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other.name}</div>
                  <div style={{ fontSize: '0.65rem', color: LINK_COLORS[l.type] }}>{LINK_LABELS[l.type]}{l.label ? ` · ${l.label}` : ''}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0,
                  background: l.strength === 3 ? '#dc2626' : l.strength === 2 ? '#d97706' : '#059669' }} title={`Strength: ${l.strength}`} />
              </div>
            );
          })}
          {connections.length > 6 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.3rem 0.5rem' }}>
              +{connections.length - 6} more connections
            </div>
          )}
        </div>

        {/* MO radar chart if suspect with moTags */}
        {isSuspect && moRadarData.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>MO Pattern Profile</div>
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={moRadarData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="tag" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
                  <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.3} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub: Offender Profile Rail ───────────────────────────────────────────────
const OffenderRail: React.FC<{
  suspects: any[];
  selected: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
}> = ({ suspects, selected, onSelect, search, onSearch }) => {
  const filtered = suspects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.district?.toLowerCase().includes(search.toLowerCase()) ||
    s.moTags?.some((m: string) => m.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{
      width: 270, minWidth: 270, flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '0.9rem 0.9rem 0.65rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.7rem' }}>
          <Users size={14} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>Repeat Offenders</span>
          <span style={{ marginLeft: 'auto', background: '#dc2626', color: 'white', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem' }}>
            {suspects.length}
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="search-input" value={search} onChange={e => onSearch(e.target.value)} placeholder="Name, district, MO…" />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.7rem' }}>
        {filtered.map(s => (
          <div key={s.id} className={`offender-card${selected === s.id ? ' selected' : ''}`} onClick={() => onSelect(s.id)}>
            {/* Name row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${NODE_COLORS.suspect}20`, border: `1.5px solid ${NODE_COLORS.suspect}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: NODE_COLORS.suspect, flexShrink: 0 }}>
                  {s.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>{s.name}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{s.district}</div>
                </div>
              </div>
              <div style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: 4,
                background: (s.riskScore ?? 0) >= 85 ? 'rgba(220,38,38,0.12)' : (s.riskScore ?? 0) >= 65 ? 'rgba(234,88,12,0.12)' : 'rgba(217,119,6,0.12)',
                color: (s.riskScore ?? 0) >= 85 ? '#dc2626' : (s.riskScore ?? 0) >= 65 ? '#ea580c' : '#d97706',
              }}>
                {s.riskScore}
              </div>
            </div>
            {/* MO chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginBottom: '0.3rem' }}>
              {s.moTags?.slice(0, 2).map((tag: string) => (
                <span key={tag} className="mo-chip" style={{ fontSize: '0.6rem', background: `${MO_COLORS[tag] ?? '#6b7280'}15`, color: MO_COLORS[tag] ?? '#6b7280', border: `1px solid ${MO_COLORS[tag] ?? '#6b7280'}30` }}>
                  {tag}
                </span>
              ))}
              {(s.moTags?.length ?? 0) > 2 && (
                <span className="mo-chip" style={{ fontSize: '0.6rem', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  +{(s.moTags?.length ?? 0) - 2}
                </span>
              )}
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              <span>⚖ {s.priorConvictions} convictions</span>
              <span>📁 {s.firs?.length} FIRs</span>
              <span>🗺 {s.jurisdictions?.length} districts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.6rem 0.9rem', borderTop: '1px solid var(--border-color)', fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Crosshair size={11} /> Sorted by Risk Score
      </div>
    </div>
  );
};

// ─── Sub: Association Detection Table ─────────────────────────────────────────
const AssociationTable: React.FC<{ associations: any[] }> = ({ associations }) => {
  const [sortBy, setSortBy] = useState<'confidence' | 'shared' | 'flag'>('confidence');

  const sorted = useMemo(() => {
    const a = [...associations];
    if (sortBy === 'confidence') a.sort((x, y) => y.confidence - x.confidence);
    if (sortBy === 'shared')     a.sort((x, y) => y.sharedLinks - x.sharedLinks);
    if (sortBy === 'flag') {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      a.sort((x, y) => order[x.flag] - order[y.flag]);
    }
    return a;
  }, [associations, sortBy]);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Sort bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort:</span>
        {(['confidence', 'shared', 'flag'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)} style={{
            padding: '0.2rem 0.55rem', borderRadius: 4, fontSize: '0.7rem',
            background: sortBy === s ? 'var(--accent-primary)' : 'transparent',
            color: sortBy === s ? 'white' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)', cursor: 'pointer',
            textTransform: 'capitalize',
          }}>
            {s === 'confidence' ? 'Confidence %' : s === 'shared' ? 'Shared Links' : 'Flag Level'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          {sorted.length} associations detected
        </span>
      </div>

      {/* Header row */}
      <div className="assoc-row" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', cursor: 'default' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entity A</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entity B</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confidence</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Flag</span>
      </div>

      {sorted.map((a, i) => (
        <div key={i}>
          <div className="assoc-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.entityA}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.entityB}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.9rem', fontWeight: 700,
                color: a.confidence >= 85 ? '#dc2626' : a.confidence >= 65 ? '#ea580c' : '#d97706',
              }}>
                {a.confidence}%
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{a.sharedLinks} links</div>
            </div>
            <div>
              <span className={`badge badge-${a.flag}`}>{a.flag}</span>
            </div>
          </div>
          {/* Method row */}
          <div style={{ padding: '0.35rem 0.75rem 0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <GitBranch size={11} style={{ marginTop: 2, flexShrink: 0, color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{a.method}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
type ActiveTab = 'network' | 'associations';

export const NetworkAnalysis: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // ── State
  const [activeTab,       setActiveTab]       = useState<ActiveTab>('network');
  const [rawNodes,        setRawNodes]        = useState<CrimeNode[]>([]);
  const [rawLinks,        setRawLinks]        = useState<CrimeLink[]>([]);
  const [suspectsList,    setSuspectsList]    = useState<any[]>([]);
  const [associations,    setAssociations]    = useState<any[]>([]);
  const [selectedNodeId,  setSelectedNodeId]  = useState<string | null>(null);
  const [highlightedIds,  setHighlightedIds]  = useState<Set<string>>(new Set());
  const [offenderSearch,  setOffenderSearch]  = useState('');
  const [filterGroups,    setFilterGroups]    = useState<Set<NodeGroup>>(
    new Set(['suspect', 'victim', 'location', 'case', 'vehicle', 'organization'])
  );
  const [filterLinks,     setFilterLinks]     = useState<Set<LinkType>>(
    new Set(['accused_in', 'victim_in', 'occurred_at', 'linked_case', 'derived_mo', 'associate', 'uses_vehicle', 'member_of'])
  );
  const [showLegend, setShowLegend] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load from API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const graphRes = await api.getNetworkGraph(
          Array.from(filterGroups),
          Array.from(filterLinks)
        );
        const offendersRes = await api.getOffenders();
        const associationsRes = await api.getAssociations();

        setRawNodes(graphRes.nodes);
        setRawLinks(graphRes.links);
        setSuspectsList(offendersRes);
        setAssociations(associationsRes);
      } catch (err) {
        console.error("Network intelligence loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filterGroups, filterLinks]);

  // Dimensions
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Filtered graph data
  const graphData = useMemo(() => {
    const nodes = rawNodes.filter(n => filterGroups.has(n.group));
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = rawLinks.filter(l => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return filterLinks.has(l.type) && nodeIds.has(srcId) && nodeIds.has(tgtId);
    });
    return { nodes: nodes.map(n => ({ ...n })), links: links.map(l => ({ ...l })) };
  }, [rawNodes, rawLinks, filterGroups, filterLinks]);

  // ── Selection
  const selectedNode = useMemo(() => rawNodes.find(n => n.id === selectedNodeId) ?? null, [rawNodes, selectedNodeId]);

  const handleNodeClick = useCallback((node: any) => {
    const id = node.id as string;
    setSelectedNodeId(prev => prev === id ? null : id);
    // Highlight connected nodes
    const connected = new Set<string>([id]);
    rawLinks.forEach(l => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (srcId === id) connected.add(tgtId);
      if (tgtId === id) connected.add(srcId);
    });
    setHighlightedIds(connected);
  }, [rawLinks]);

  const handleOffenderSelect = useCallback((id: string) => {
    setActiveTab('network');
    setSelectedNodeId(id);
    const connected = new Set<string>([id]);
    rawLinks.forEach(l => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (srcId === id) connected.add(tgtId);
      if (tgtId === id) connected.add(srcId);
    });
    setHighlightedIds(connected);
  }, [rawLinks]);

  // ── Toggle helpers
  const toggleGroup = (g: NodeGroup) => {
    setFilterGroups(prev => {
      const s = new Set(prev);
      s.has(g) ? s.delete(g) : s.add(g);
      return s;
    });
  };
  const toggleLink = (l: LinkType) => {
    setFilterLinks(prev => {
      const s = new Set(prev);
      s.has(l) ? s.delete(l) : s.add(l);
      return s;
    });
  };

  // ── Canvas rendering colors
  const bgColor   = isDark ? '#0b0f19' : '#f1f5f9';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const dimAlpha  = highlightedIds.size > 0 ? 0.12 : 1;

  // ── Stats
  const stats = useMemo(() => ({
    nodes:    graphData.nodes.length,
    links:    graphData.links.length,
    suspects: graphData.nodes.filter(n => n.group === 'suspect').length,
    orgs:     graphData.nodes.filter(n => n.group === 'organization').length,
    crossJurisdiction: suspectsList.filter(s => (s.jurisdictions?.length ?? 0) > 1).length,
  }), [graphData, suspectsList]);

  if (loading && rawNodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div className="pulse-alert" style={{ width: 14, height: 14, background: 'var(--accent-primary)' }} />
          <span>Constructing Criminological Link Network...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', gap: '0.7rem' }}>

      {/* ── Stats Ribbon ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem', flexShrink: 0 }}>
        {[
          { icon: <Network size={16} color="#dc2626" />,   label: 'Network Entities',       value: stats.nodes,           color: '#dc2626' },
          { icon: <Link2 size={16} color="#7c3aed" />,     label: 'Relationship Links',      value: stats.links,           color: '#7c3aed' },
          { icon: <Users size={16} color="#ea580c" />,     label: 'Repeat Suspects',         value: stats.suspects,        color: '#ea580c' },
          { icon: <Shield size={16} color="#db2777" />,    label: 'Crime Organizations',     value: stats.orgs,            color: '#db2777' },
          { icon: <MapPin size={16} color="#d97706" />,    label: 'Cross-Jurisdiction',      value: stats.crossJurisdiction, color: '#d97706' },
        ].map((item, i) => (
          <div key={i} className="glass-panel" style={{ padding: '0.75rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ padding: '0.45rem', background: `${item.color}18`, borderRadius: '7px', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + Controls ──────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '0.55rem 0.9rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        {/* Tabs */}
        <button className={`network-tab${activeTab === 'network' ? ' active' : ''}`} onClick={() => setActiveTab('network')}>
          <Network size={13} /> Relationship Map
        </button>
        <button className={`network-tab${activeTab === 'associations' ? ' active' : ''}`} onClick={() => setActiveTab('associations')}>
          <GitBranch size={13} /> Association Detection
          <span style={{ background: '#dc2626', color: 'white', borderRadius: 99, fontSize: '0.6rem', fontWeight: 700, padding: '0 0.3rem', marginLeft: 2 }}>
            {associations.filter(a => a.flag === 'high').length}
          </span>
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />

        {/* Node type filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <Filter size={12} /> Entities:
        </div>
        {(Object.entries(NODE_COLORS) as [NodeGroup, string][]).map(([group, color]) => (
          <button key={group} onClick={() => toggleGroup(group)} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.55rem', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600,
            background: filterGroups.has(group) ? `${color}18` : 'var(--bg-tertiary)',
            color: filterGroups.has(group) ? color : 'var(--text-secondary)',
            border: filterGroups.has(group) ? `1px solid ${color}40` : '1px solid var(--border-color)',
            cursor: 'pointer', transition: 'all 0.15s ease', textTransform: 'capitalize',
            opacity: filterGroups.has(group) ? 1 : 0.5,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
            {group}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />

        {/* Link type filters — key ones */}
        {([['derived_mo', 'Same MO'], ['associate', 'Associates'], ['member_of', 'Org Links']] as [LinkType, string][]).map(([lt, label]) => (
          <button key={lt} onClick={() => toggleLink(lt)} style={{
            padding: '0.25rem 0.55rem', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600,
            background: filterLinks.has(lt) ? `${LINK_COLORS[lt]}18` : 'var(--bg-tertiary)',
            color: filterLinks.has(lt) ? LINK_COLORS[lt] : 'var(--text-secondary)',
            border: filterLinks.has(lt) ? `1px solid ${LINK_COLORS[lt]}40` : '1px solid var(--border-color)',
            cursor: 'pointer', transition: 'all 0.15s ease',
            opacity: filterLinks.has(lt) ? 1 : 0.5,
          }}>
            ⊞ {label}
          </button>
        ))}

        <button onClick={() => setHighlightedIds(new Set())} style={{ marginLeft: 'auto', padding: '0.25rem 0.65rem', borderRadius: 5, fontSize: '0.7rem', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
          Clear Selection
        </button>
        <button onClick={() => setShowLegend(s => !s)} style={{ padding: '0.25rem 0.65rem', borderRadius: 5, fontSize: '0.7rem', background: showLegend ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: showLegend ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
          <Eye size={12} style={{ display: 'inline', marginRight: 4 }} />Legend
        </button>
      </div>

      {/* ── Main Panel ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>

        {/* Left: Offender Rail */}
        <OffenderRail
          suspects={suspectsList}
          selected={selectedNodeId}
          onSelect={handleOffenderSelect}
          search={offenderSearch}
          onSearch={setOffenderSearch}
        />

        {/* Center: Graph or Association Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          {activeTab === 'network' ? (
            <>
              <div ref={containerRef} style={{ flex: 1, background: bgColor }}>
                <ForceGraph2D
                  width={dimensions.width}
                  height={dimensions.height}
                  graphData={graphData}
                  nodeRelSize={5}
                  linkDirectionalParticles={3}
                  linkDirectionalParticleSpeed={(l: any) => l.type === 'derived_mo' || l.type === 'associate' ? 0.007 : 0.003}
                  linkDirectionalParticleWidth={(l: any) => (l.strength ?? 1) * 1.5}
                  linkColor={(l: any) => {
                    const base = LINK_COLORS[l.type as LinkType] ?? '#6b7280';
                    const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
                    const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
                    const isHighlighted = highlightedIds.size === 0 ||
                      (highlightedIds.has(srcId) && highlightedIds.has(tgtId));
                    return isHighlighted ? base : `${base}30`;
                  }}
                  linkWidth={(l: any) => (l.strength ?? 1) * 0.8}
                  linkLineDash={(l: any) => l.type === 'derived_mo' || l.type === 'linked_case' ? [4, 4] : l.type === 'associate' ? [2, 2] : []}
                  backgroundColor={bgColor}
                  onNodeClick={handleNodeClick}
                  onBackgroundClick={() => { setSelectedNodeId(null); setHighlightedIds(new Set()); }}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const n = node as CrimeNode & { x: number; y: number };
                    const color  = NODE_COLORS[n.group] ?? '#6b7280';
                    const isHigh = highlightedIds.size === 0 || highlightedIds.has(n.id);
                    const isSelected = selectedNodeId === n.id;
                    const radius = Math.sqrt(n.val) * 1.4;
                    const alpha  = isHigh ? 1 : dimAlpha;

                    ctx.save();
                    ctx.globalAlpha = alpha;

                    // Selection glow
                    if (isSelected) {
                      ctx.shadowColor  = color;
                      ctx.shadowBlur   = 16;
                      ctx.shadowOffsetX = 0;
                      ctx.shadowOffsetY = 0;
                    }

                    // Circle fill
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
                    ctx.fillStyle = `${color}35`;
                    ctx.fill();

                    // Circle stroke
                    ctx.strokeStyle = color;
                    ctx.lineWidth   = isSelected ? 2.5 : 1.5;
                    ctx.stroke();
                    ctx.shadowBlur  = 0;

                    // Icon
                    const iconSize = Math.max(6, radius * 0.9);
                    ctx.font = `${iconSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = color;
                    ctx.fillText(NODE_ICONS[n.group], n.x, n.y);

                    // Label
                    const labelSize = Math.max(7, 10 / globalScale);
                    ctx.font = `${isSelected ? 'bold ' : ''}${labelSize}px Inter, sans-serif`;
                    const label  = n.name.length > 18 ? n.name.slice(0, 17) + '…' : n.name;
                    const lw     = ctx.measureText(label).width;
                    const lh     = labelSize + 2;
                    const ly     = n.y + radius + lh * 0.7;

                    ctx.fillStyle = isDark ? 'rgba(11,15,25,0.78)' : 'rgba(248,250,252,0.82)';
                    ctx.fillRect(n.x - lw / 2 - 2, ly - lh / 2, lw + 4, lh);
                    ctx.fillStyle = isSelected ? color : textColor;
                    ctx.fillText(label, n.x, ly);

                    ctx.restore();
                    node.__radius = radius;
                  }}
                  nodePointerAreaPaint={(node: any, color, ctx) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, (node.__radius ?? 8) + 4, 0, 2 * Math.PI);
                    ctx.fill();
                  }}
                />
              </div>

              {/* Legend overlay */}
              {showLegend && (
                <div style={{
                  position: 'absolute', bottom: '1rem', left: '1rem',
                  background: isDark ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.92)',
                  border: '1px solid var(--border-color)', borderRadius: 8,
                  padding: '0.7rem 0.85rem', boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', flexDirection: 'column', gap: '0.9rem',
                }}>
                  {/* Nodes */}
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Node Types</div>
                    {(Object.entries(NODE_COLORS) as [NodeGroup, string][]).filter(([g]) => filterGroups.has(g)).map(([group, color]) => (
                      <div key={group} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${color}`, background: `${color}30` }} />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{group}</span>
                      </div>
                    ))}
                  </div>
                  {/* Links */}
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Link Types</div>
                    {([['derived_mo', 'Same MO — Dashed'], ['associate', 'Associate — Dotted'], ['accused_in', 'Accused In'], ['occurred_at', 'Occurred At']] as [LinkType, string][]).map(([lt, label]) => (
                      <div key={lt} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: 18, height: 2, background: LINK_COLORS[lt], borderRadius: 1 }} />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-primary)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Click node to expand connections</div>
                </div>
              )}

              {/* Instruction banner */}
              {highlightedIds.size === 0 && !selectedNodeId && (
                <div style={{
                  position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                  background: isDark ? 'rgba(17,24,39,0.88)' : 'rgba(255,255,255,0.88)',
                  border: '1px solid var(--border-color)', borderRadius: 20,
                  padding: '0.4rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)',
                  backdropFilter: 'blur(6px)', whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}>
                  Click a node to highlight its network · Click offender on the left to focus
                </div>
              )}
            </>
          ) : (
            /* Association Detection view */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <AlertTriangle size={16} color="#dc2626" />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Hidden Criminal Associations</h3>
                  <span className="badge badge-critical" style={{ marginLeft: '0.25rem' }}>
                    {associations.filter(a => a.flag === 'high').length} High Priority
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Algorithmically detected entity relationships invisible in isolated spreadsheets. Each association is scored by shared evidence links and MO overlap.
                </p>
              </div>
              <AssociationTable associations={associations} />
            </div>
          )}
        </div>

        {/* Right: Entity Detail Panel */}
        {selectedNode && (
          <EntityDetailPanel
            node={selectedNode}
            allNodes={rawNodes}
            allLinks={rawLinks}
            onClose={() => { setSelectedNodeId(null); setHighlightedIds(new Set()); }}
          />
        )}
      </div>
    </div>
  );
};
