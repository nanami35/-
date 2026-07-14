"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface SimpleBarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  domain?: [number, number];
  color?: string;
}

export function SimpleBarChart({ data, height = 280, domain, color = "#1A2B4A" }: SimpleBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDF1F7" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#33507F", fontSize: 11 }} tickLine={false} interval={0} />
        <YAxis domain={domain} tick={{ fill: "#94A9C9", fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: "#F2F5FA" }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
