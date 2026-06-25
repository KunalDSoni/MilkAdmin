'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  height?: number;
  className?: string;
  formatValue?: (v: number) => string;
}

/**
 * Dependency-free responsive area chart. Uses a fixed viewBox and
 * preserveAspectRatio so it scales fluidly across breakpoints.
 */
export function TrendChart({ data, height = 200, className, formatValue }: TrendChartProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const W = 600;
  const H = 200;
  const pad = { top: 16, right: 8, bottom: 24, left: 8 };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-sm text-muted-foreground', className)}
        style={{ height }}
      >
        No data for this period
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const x = (i: number) => pad.left + i * stepX;
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');
  const area = `${line} L ${x(data.length - 1)} ${pad.top + innerH} L ${x(0)} ${pad.top + innerH} Z`;

  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label="Daily collection trend"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad.left}
            x2={W - pad.right}
            y1={pad.top + innerH * g}
            y2={pad.top + innerH * g}
            stroke="hsl(var(--border))"
            strokeDasharray="3 4"
          />
        ))}
        <path d={area} fill="url(#trendFill)" />
        <path
          d={line}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <g key={d.label}>
            <circle
              cx={x(i)}
              cy={y(d.value)}
              r={hover === i ? 4 : 0}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--card))"
              strokeWidth={2}
            />
            <rect
              x={x(i) - stepX / 2}
              y={0}
              width={stepX || innerW}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={d.label} className={cn(i === hover && 'font-semibold text-foreground')}>
            {d.label}
          </span>
        ))}
      </div>
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1 text-xs shadow-md">
          <span className="font-medium text-foreground">{data[hover].label}: </span>
          <span className="text-primary">
            {formatValue ? formatValue(data[hover].value) : data[hover].value}
          </span>
        </div>
      )}
    </div>
  );
}
