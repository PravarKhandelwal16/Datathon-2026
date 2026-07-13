import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useTheme } from '../context/ThemeContext';

const mockGraphData = {
  nodes: [
    { id: 'Accused1', name: 'Ravi K.', group: 'accused', val: 20 },
    { id: 'Accused2', name: 'Suresh M.', group: 'accused', val: 20 },
    { id: 'Victim1', name: 'Anil B.', group: 'victim', val: 15 },
    { id: 'Location1', name: 'Majestic Bus Stand', group: 'location', val: 30 },
    { id: 'Case1', name: 'FIR 104/2026', group: 'case', val: 10 },
    { id: 'Case2', name: 'FIR 215/2026', group: 'case', val: 10 },
  ],
  links: [
    { source: 'Accused1', target: 'Case1' },
    { source: 'Victim1', target: 'Case1' },
    { source: 'Location1', target: 'Case1' },
    { source: 'Accused2', target: 'Case2' },
    { source: 'Location1', target: 'Case2' },
    // Derived link
    { source: 'Accused1', target: 'Accused2', type: 'derived_mo' }
  ]
};

export const NetworkAnalysis: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { theme } = useTheme();

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDark = theme === 'dark';
  const forceBgColor = isDark ? '#0b0f19' : '#f8fafc';
  const derivedLinkColor = isDark ? '#ef4444' : '#dc2626';
  const standardLinkColor = isDark ? '#4b5563' : '#d1d5db';
  const labelBgColor = isDark ? 'rgba(11, 15, 25, 0.8)' : 'rgba(243, 244, 246, 0.8)';
  const labelTextColor = isDark ? '#f9fafb' : '#111827';

  return (
    <div className="glass-panel" style={{ height: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Criminological Network Mapping</h2>
        <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '0.875rem' }}>Visualizing relationships between suspects, cases, and locations.</p>
      </div>
      
      <div ref={containerRef} style={{ flex: 1, border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={mockGraphData}
          nodeAutoColorBy="group"
          nodeRelSize={6}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={d => d.type === 'derived_mo' ? 0.005 : 0}
          linkColor={link => link.type === 'derived_mo' ? derivedLinkColor : standardLinkColor}
          linkLineDash={link => link.type === 'derived_mo' ? [5, 5] : []}
          backgroundColor={forceBgColor}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = labelBgColor;
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Color based on group
            if(node.group === 'accused') ctx.fillStyle = isDark ? '#f87171' : '#dc2626'; // danger
            else if(node.group === 'victim') ctx.fillStyle = isDark ? '#34d399' : '#059669'; // success
            else if(node.group === 'location') ctx.fillStyle = isDark ? '#fbbf24' : '#d97706'; // warning
            else ctx.fillStyle = labelTextColor; // primary text

            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions;
          }}
        />
      </div>
    </div>
  );
};
