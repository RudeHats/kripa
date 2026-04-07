"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PollutantData, getPollutantColor } from "@/lib/aqi-data";
import { AnimatedCard } from "./animated-card";

interface PollutantsChartProps {
    pollutants: PollutantData[];
}

export function PollutantsChart({ pollutants }: PollutantsChartProps) {
    const data = useMemo(() => {
        return pollutants.map((p) => ({
            name: p.shortName,
            value: p.value,
            maxSafe: p.maxSafe,
            color: getPollutantColor(p.value, p.maxSafe),
            fullName: p.name,
            unit: p.unit
        }));
    }, [pollutants]);

    return (
        <AnimatedCard delay={600} hover={false} className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-muted-foreground">
                    Live Pollutant Breakdown
                </h2>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                            width={50}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div className="glass-card p-3 rounded-lg border border-border bg-background/95 shadow-xl">
                                            <p className="font-medium text-sm text-foreground">{d.fullName} ({d.name})</p>
                                            <p className="text-xl font-bold mt-1" style={{ color: d.color }}>
                                                {d.value} <span className="text-xs text-muted-foreground font-normal">{d.unit}</span>
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                Safe Limit: {d.maxSafe} {d.unit}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AnimatedCard>
    );
}
