"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export interface LineSeriesDef {
  dataKey: string;
  name: string;
  color: string;
}

interface KpiLineChartProps {
  data: Array<Record<string, string | number | null>>;
  xKey: string;
  series: LineSeriesDef[];
  height?: number;
}

export function KpiLineChart({ data, xKey, series, height = 280 }: KpiLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F7" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: "#33507F", fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fill: "#94A9C9", fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
