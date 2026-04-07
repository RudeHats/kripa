"use client";

import { useState, useEffect, useRef } from "react";
import { mockAQIData, getAQIColor } from "@/lib/aqi-data";
import { Sidebar } from "./sidebar";
import { AQIGauge } from "./aqi-gauge";
import { TrendChart } from "./trend-chart";
import { PredictionCard } from "./prediction-card";
import { AlertBanner } from "./alert-banner";
import { AQIChatbot } from "./aqi-chatbot";
import { AQICharacter } from "./aqi-character";
import { AnimatedCard } from "./animated-card";
import { AnimatedButton } from "./animated-button";
import { AnimatedBackground } from "./animated-background";
import { fetchWAQIData, fetchWAQIByCity } from "@/lib/waqi-api";
import { PollutantsChart } from "./pollutants-chart";
import { SettingsModal } from "./settings-modal";
import dynamic from "next/dynamic";

const MapSelector = dynamic(() => import("./map-selector").then((mod) => mod.MapSelector), { ssr: false });

import { Bell, Settings, RefreshCw, Info, TrendingUp, TrendingDown, MapPin } from "lucide-react";

export function AQIDashboard() {
  const [data, setData] = useState(mockAQIData);
  const [showAlert, setShowAlert] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const color = getAQIColor(data.aqi);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCityChange = async (city: string) => {
    const cityName = city.split(",")[0];
    setIsLoadingLocation(true);
    const waqiData = await fetchWAQIByCity(cityName);
    if (waqiData) {
      setData(waqiData);
      setShowAlert(true);
    } else {
      // Fallback
      setData({ ...data, city: cityName });
    }
    setIsLoadingLocation(false);
  };

  const handleLocationSelected = async (lat: number, lng: number) => {
    setIsLoadingLocation(true);
    const waqiData = await fetchWAQIData(lat, lng);
    if (waqiData) {
      setData(waqiData);
      setShowAlert(true); // show the banner for new location
    }
    setIsLoadingLocation(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { city, lat, lng } = dataRef.current;
      if (lat && lng) {
        const waqiData = await fetchWAQIData(lat, lng);
        if (waqiData) setData(waqiData);
      } else if (city) {
        const waqiData = await fetchWAQIByCity(city);
        if (waqiData) setData(waqiData);
      }
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setData(prev => ({ ...prev, lastUpdated: new Date() }));
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const avgAqi = Math.round(data.trend.reduce((sum, d) => sum + d.aqi, 0) / data.trend.length);
  const peakAqi = Math.max(...data.trend.map((d) => d.aqi));
  const lowAqi = Math.min(...data.trend.map((d) => d.aqi));
  const change = data.aqi - avgAqi;

  if (!mounted) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <AnimatedBackground color={color} intensity="high" />

      {/* Alert Banner */}
      {showAlert && (
        <AlertBanner aqi={data.aqi} onDismiss={() => setShowAlert(false)} />
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Sidebar */}
      <Sidebar data={data} onCityChange={handleCityChange} />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto relative">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <AQICharacter aqi={data.aqi} size="md" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Air Quality Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time air quality monitoring for {data.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatedButton
              onClick={handleRefresh}
              loading={isRefreshing}
              variant="glass"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </AnimatedButton>

            <AnimatedButton variant="glass" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {data.aqi > 150 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              )}
            </AnimatedButton>

            <AnimatedButton variant="glass" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Map Selector */}
          <div className="col-span-12 relative">
            <MapSelector
              onLocationSelected={handleLocationSelected}
              initialLocation={{ lat: data.lat || 28.6139, lng: data.lng || 77.2090 }}
            />
            {isLoadingLocation && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <span className="text-sm font-medium">Fetching real AQI data...</span>
                </div>
              </div>
            )}
          </div>
          {/* AQI Gauge - Center Top */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-5">
            <AnimatedCard delay={100} glow={color} hover={false} className="p-6">
              <div className="flex flex-col items-center">
                <h2 className="text-sm font-medium text-muted-foreground mb-4">
                  Current Air Quality Index
                </h2>
                <AQIGauge value={data.aqi} />

                {/* Stats row */}
                <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-xs">
                  {[
                    { label: "24h Avg", value: avgAqi },
                    { label: "Peak", value: peakAqi },
                    { label: "Low", value: lowAqi },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className="text-center p-2 rounded-lg glass-card animate-fade-in"
                      style={{ animationDelay: `${300 + index * 100}ms` }}
                    >
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Change indicator */}
                <div
                  className={`mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium animate-bounce-in ${change > 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                    }`}
                  style={{ animationDelay: "600ms" }}
                >
                  {change > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(change)} {change > 0 ? "above" : "below"} average</span>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Prediction Card - Right Top */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-7">
            <div className="grid gap-6">
              <AnimatedCard delay={200} hover={false} className="p-0 overflow-visible">
                <PredictionCard data={data.prediction} />
              </AnimatedCard>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "PM2.5", value: data.pollutants[0].value, unit: "μg/m³", threshold: 35, description: "Fine particles" },
                  { label: "PM10", value: data.pollutants[1].value, unit: "μg/m³", threshold: 150, description: "Coarse particles" },
                  { label: "NO₂", value: data.pollutants[2].value, unit: "ppb", threshold: 53, description: "Nitrogen dioxide" },
                  { label: "O₃", value: data.pollutants[3].value, unit: "ppb", threshold: 70, description: "Ozone" },
                ].map((stat, index) => {
                  const statColor = stat.value > stat.threshold ? "#ef4444" : "#22c55e";
                  const percentage = (stat.value / stat.threshold) * 100;

                  return (
                    <AnimatedCard
                      key={stat.label}
                      delay={300 + index * 100}
                      glow={statColor}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                        <div className="group relative">
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                          <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            {stat.description}
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: statColor }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{stat.unit}</div>

                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: statColor,
                            boxShadow: `0 0 8px ${statColor}`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {percentage.toFixed(0)}% of safe limit
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trend Chart - Full Width */}
          <div className="col-span-12 lg:col-span-8">
            <AnimatedCard delay={500} hover={false} className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-muted-foreground">
                  24-Hour Trend
                </h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: color }}
                    />
                    <span>AQI Value</span>
                  </div>
                </div>
              </div>
              <TrendChart data={data.trend} currentAqi={data.aqi} />
            </AnimatedCard>
          </div>

          {/* Pollutants Chart */}
          <div className="col-span-12 lg:col-span-4">
            <PollutantsChart pollutants={data.pollutants} />
          </div>

          {/* AQI Scale Legend */}
          <div className="col-span-12">
            <AnimatedCard delay={600} hover={false} className="p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                AQI Scale
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { range: "0-50", label: "Good", color: "#22c55e" },
                  { range: "51-100", label: "Moderate", color: "#eab308" },
                  { range: "101-150", label: "Unhealthy (Sensitive)", color: "#f97316" },
                  { range: "151-200", label: "Unhealthy", color: "#ef4444" },
                  { range: "201-300", label: "Very Unhealthy", color: "#a855f7" },
                  { range: "301+", label: "Hazardous", color: "#7f1d1d" },
                ].map((item, index) => (
                  <div
                    key={item.range}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 cursor-default animate-fade-in"
                    style={{
                      backgroundColor: `${item.color}15`,
                      animationDelay: `${700 + index * 50}ms`,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-foreground font-medium">
                      {item.range}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <AQIChatbot aqi={data.aqi} city={data.city} />
    </div>
  );
}
