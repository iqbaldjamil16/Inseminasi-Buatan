'use client';

import React from 'react';

interface MapData {
  name: string; // Puskeswan name, e.g., 'Puskeswan Topoyo'
  count: number;
}

interface MamujuTengahMapProps {
  data: MapData[];
  total: number;
}

// A map to link Puskeswan names to sub-district IDs in the SVG
const puskeswanToKecamatanId: Record<string, string> = {
  'Puskeswan Topoyo': 'topoyo',
  'Puskeswan Tobadak': 'tobadak',
  'Puskeswan Pangale': 'pangale',
  'Puskeswan Budong-Budong': 'budong-budong',
  'Puskeswan Karossa': 'karossa',
};

// Simplified and stylized representation of Mamuju Tengah sub-districts
const kecamatanPaths: Record<string, { d: string, name: string, textPos: {x: number, y: number} }> = {
    karossa: {
      d: "M 10 10 L 80 10 L 90 60 L 50 110 L 10 90 Z",
      name: "Karossa",
      textPos: { x: 45, y: 65 }
    },
    'budong-budong': {
      d: "M 80 10 L 150 10 L 160 50 L 90 60 Z",
      name: "Budong-Budong",
      textPos: { x: 120, y: 40 }
    },
    pangale: {
      d: "M 150 10 L 220 10 L 230 60 L 160 50 Z",
      name: "Pangale",
      textPos: { x: 190, y: 40 }
    },
    topoyo: {
      d: "M 90 60 L 190 60 L 200 120 L 50 110 Z",
      name: "Topoyo",
      textPos: { x: 120, y: 90 }
    },
    tobadak: {
      d: "M 190 60 L 230 60 L 250 110 L 200 120 Z",
      name: "Tobadak",
      textPos: { x: 220, y: 90 }
    },
};

export function MamujuTengahMap({ data, total }: MamujuTengahMapProps) {
  const mapData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const kecamatanId = puskeswanToKecamatanId[item.name];
      if (kecamatanId) {
        counts[kecamatanId] = item.count;
      }
    });
    return counts;
  }, [data]);
  
  const maxCount = React.useMemo(() => Math.max(1, ...Object.values(mapData)), [mapData]);

  const getColor = (kecamatanId: string) => {
    const count = mapData[kecamatanId] || 0;
    if (count === 0) return 'hsl(var(--muted))';
    const opacity = 0.2 + (count / maxCount) * 0.8; // from 20% to 100% opacity
    return `hsla(var(--primary), ${opacity})`;
  };

  return (
    <div className="relative w-full h-[350px] flex items-center justify-center">
      <svg viewBox="0 0 260 130" className="w-full h-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <title>Peta Kabupaten Mamuju Tengah</title>
        <g>
          {Object.entries(kecamatanPaths).map(([id, { d, name, textPos }]) => {
            const count = mapData[id] || 0;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
            return (
              <g key={id} className="group">
                <path
                  d={d}
                  fill={getColor(id)}
                  stroke="hsl(var(--card))"
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] font-semibold fill-primary-foreground pointer-events-none"
                  style={{ opacity: count > 0 ? 1 : 0.6 }}
                >
                  {name}
                </text>
                { count > 0 && (
                    <text
                        x={textPos.x}
                        y={textPos.y + 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[9px] font-bold fill-primary-foreground pointer-events-none"
                    >
                        {count} ({percentage}%)
                    </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
