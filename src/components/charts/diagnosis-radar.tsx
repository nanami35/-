"use client";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip,
} from "recharts";

export interface RadarSeries {
  name: string;
  color: string;
  values: Record<string, number>;
}

interface DiagnosisRadarProps {
  categories: { key: string; label: string }[];
  series: RadarSeries[];
}

export function DiagnosisRadar({ categories, series }: DiagnosisRadarProps) {
  const data = categories.map((c) => {
    const row: Record<string, string | number> = { category: c.label };
    for (const s of series) row[s.name] = s.values[c.key] ?? 0;
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#E1E8F2" />
        <PolarAngleAxis dataKey="category" tick={{ fill: "#33507F", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#94A9C9", fontSize: 10 }} />
        {series.map((s) => (
          <Radar key={s.name} name={s.name} dataKey={s.name} stroke={s.color} fill={s.color} fillOpacity={0.25} />
        ))}
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
