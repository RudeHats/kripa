"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { PredictionDataPoint, getAQIColor } from "@/lib/aqi-data";

interface PredictionCardProps {
  data: PredictionDataPoint[];
}

export function PredictionCard({ data }: PredictionCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [range, setRange] = useState(48);

  const displayData = data.slice(0, range);

  const firstAqi = displayData[0]?.aqi || 0;
  const lastAqi = displayData[displayData.length - 1]?.aqi || 0;
  const isImproving = lastAqi < firstAqi;
  const percentChange = Math.round(((firstAqi - lastAqi) / firstAqi) * 100);

  const startColor = getAQIColor(firstAqi);
  const endColor = getAQIColor(lastAqi);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`p-4 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Forecast
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="bg-secondary/50 border border-border text-xs rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary text-foreground ml-2"
          >
            <option value={24}>Next 1d</option>
            <option value={48}>Next 2d</option>
            <option value={72}>Next 3d</option>
          </select>
        </h3>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isImproving
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
            }`}
          style={{
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          {isImproving ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <TrendingUp className="w-3 h-3" />
          )}
          {isImproving ? "Improving" : "Worsening"} ({Math.abs(percentChange)}%)
        </div>
      </div>

      <div className="h-[80px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="predictionGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={startColor} stopOpacity={0.5} />
                <stop offset="100%" stopColor={endColor} stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="predictionStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={startColor} />
                <stop offset="100%" stopColor={endColor} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="url(#predictionStroke)"
              strokeWidth={2}
              fill="url(#predictionGradient)"
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Now</span>
        <span>+{range / 2}h</span>
        <span>+{range}h</span>
      </div>
    </div>
  );
}
