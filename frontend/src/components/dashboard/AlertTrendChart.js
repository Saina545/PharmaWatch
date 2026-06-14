import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { subDays, format, isSameDay } from 'date-fns';

const SEVERITY_COLORS = {
  CRITICAL: '#ff3b5c',
  HIGH: '#ff7c1a',
  MEDIUM: '#ffd700',
  LOW: '#00e676',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0c1428',
      border: '1px solid #1a2845',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      fontFamily: 'Space Mono, monospace',
    }}>
      <p style={{ color: '#7a93c8', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill, marginBottom: 2 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function AlertTrendChart({ alerts }) {
  const data = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return days.map(day => {
      const dayAlerts = alerts.filter(a => isSameDay(new Date(a.createdAt), day));
      return {
        day: format(day, 'EEE'),
        CRITICAL: dayAlerts.filter(a => a.severity === 'CRITICAL').length,
        HIGH: dayAlerts.filter(a => a.severity === 'HIGH').length,
        MEDIUM: dayAlerts.filter(a => a.severity === 'MEDIUM').length,
        LOW: dayAlerts.filter(a => a.severity === 'LOW').length,
      };
    });
  }, [alerts]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={8} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2845" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: '#7a93c8', fontSize: 11, fontFamily: 'Space Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#3d5a8a', fontSize: 10, fontFamily: 'Space Mono' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={20}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="CRITICAL" stackId="a" fill={SEVERITY_COLORS.CRITICAL} radius={[0,0,0,0]} />
        <Bar dataKey="HIGH" stackId="a" fill={SEVERITY_COLORS.HIGH} radius={[0,0,0,0]} />
        <Bar dataKey="MEDIUM" stackId="a" fill={SEVERITY_COLORS.MEDIUM} radius={[0,0,0,0]} />
        <Bar dataKey="LOW" stackId="a" fill={SEVERITY_COLORS.LOW} radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
