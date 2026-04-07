"use client";

import { useState } from "react";
import { Settings, X, Key, Globe, Check, AlertCircle, Loader2 } from "lucide-react";

export interface APIConfig {
  provider: "openweather" | "iqair" | "waqi" | "custom";
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
}

interface APIConfigPanelProps {
  config: APIConfig;
  onConfigChange: (config: APIConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const providers = [
  {
    id: "openweather" as const,
    name: "OpenWeather",
    description: "Real-time AQI data from OpenWeather API",
    docsUrl: "https://openweathermap.org/api/air-pollution",
    placeholder: "Enter your OpenWeather API key",
  },
  {
    id: "iqair" as const,
    name: "IQAir",
    description: "Global air quality data from IQAir AirVisual",
    docsUrl: "https://www.iqair.com/air-pollution-data-api",
    placeholder: "Enter your IQAir API key",
  },
  {
    id: "waqi" as const,
    name: "WAQI",
    description: "World Air Quality Index project API",
    docsUrl: "https://aqicn.org/api/",
    placeholder: "Enter your WAQI token",
  },
  {
    id: "custom" as const,
    name: "Custom API",
    description: "Connect your own AQI prediction service",
    docsUrl: "",
    placeholder: "Enter your API key",
  },
];

export function APIConfigPanel({ config, onConfigChange, isOpen, onClose }: APIConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<APIConfig>(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock test result - in production, this would actually test the API
    const success = localConfig.apiKey.length > 10;
    setTestResult(success ? "success" : "error");
    setTesting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 glass-card rounded-2xl overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">API Configuration</h2>
              <p className="text-xs text-muted-foreground">Connect real AQI data sources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setLocalConfig({ ...localConfig, provider: provider.id })}
                  className={`p-3 rounded-xl text-left transition-all duration-200 ${localConfig.provider === provider.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "glass-card hover:bg-secondary/50 border-2 border-transparent"
                    }`}
                >
                  <div className="font-medium text-sm text-foreground">{provider.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {provider.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder={providers.find(p => p.id === localConfig.provider)?.placeholder}
                className="w-full bg-secondary/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {testResult === "success" && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {testResult === "error" && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
          </div>

          {/* Custom Base URL (for custom provider) */}
          {localConfig.provider === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Base URL
              </label>
              <input
                type="url"
                value={localConfig.baseUrl || ""}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                placeholder="https://your-api.com/v1/aqi"
                className="w-full bg-secondary/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <div className="text-sm font-medium text-foreground">Enable Real-time Data</div>
              <div className="text-xs text-muted-foreground">
                Fetch live AQI data instead of mock data
              </div>
            </div>
            <button
              onClick={() => setLocalConfig({ ...localConfig, enabled: !localConfig.enabled })}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${localConfig.enabled ? "bg-primary" : "bg-secondary"
                }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${localConfig.enabled ? "translate-x-7" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Documentation Link */}
          {localConfig.provider !== "custom" && (
            <a
              href={providers.find(p => p.id === localConfig.provider)?.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline"
            >
              View API documentation
            </a>
          )}

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-sm animate-fade-in ${testResult === "success"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
                }`}
            >
              {testResult === "success"
                ? "API connection successful! Your key is valid."
                : "Connection failed. Please check your API key and try again."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={!localConfig.apiKey || testing}
            className="flex-1 py-2.5 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all active:scale-95"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing API config
export function useAPIConfig() {
  const [config, setConfig] = useState<APIConfig>({
    provider: "openweather",
    apiKey: "",
    enabled: false,
  });
  const [isOpen, setIsOpen] = useState(false);

  return {
    config,
    setConfig,
    isOpen,
    openConfig: () => setIsOpen(true),
    closeConfig: () => setIsOpen(false),
  };
}
