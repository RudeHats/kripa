// AQI Mock Data and Utilities

export interface PollutantData {
  name: string;
  shortName: string;
  value: number;
  unit: string;
  maxSafe: number;
  icon: string;
}

export interface TrendDataPoint {
  time: string;
  aqi: number;
  hour: number;
}

export interface PredictionDataPoint {
  hour: number;
  aqi: number;
}

export interface AQIData {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  aqi: number;
  category: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pollutants: PollutantData[];
  trend: TrendDataPoint[];
  prediction: PredictionDataPoint[];
  healthAdvisory: string;
  lastUpdated: Date;
}

export const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return "#22c55e"; // Good - Green
  if (aqi <= 100) return "#eab308"; // Moderate - Yellow
  if (aqi <= 150) return "#f97316"; // Unhealthy for Sensitive Groups - Orange
  if (aqi <= 200) return "#ef4444"; // Unhealthy - Red
  if (aqi <= 300) return "#a855f7"; // Very Unhealthy - Purple
  return "#7f1d1d"; // Hazardous - Maroon
};

export const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export const getPollutantColor = (value: number, maxSafe: number): string => {
  const ratio = value / maxSafe;
  if (ratio <= 0.5) return "#22c55e"; // Green
  if (ratio <= 0.8) return "#eab308"; // Yellow
  if (ratio <= 1.0) return "#f97316"; // Orange
  return "#ef4444"; // Red
};

// Generate 24-hour trend data with static times to avoid hydration issues
const generateTrendData = (): TrendDataPoint[] => {
  const data: TrendDataPoint[] = [];
  const baseAqi = 167;
  // Use seeded values to ensure consistent data between server and client
  const variations = [15, -8, 22, -12, 5, 18, -5, 28, -15, 10, 25, -20, 8, 30, -10, 12, 20, -18, 6, 24, -8, 16, 22, -5];

  for (let i = 0; i < 24; i++) {
    const hour = i;
    const hourStr = hour.toString().padStart(2, '0');
    data.push({
      time: `${hourStr}:00`,
      aqi: Math.round(Math.max(50, Math.min(250, baseAqi + variations[i]))),
      hour: hour,
    });
  }
  return data;
};

// Generate 48-hour prediction with static values
const generatePrediction = (): PredictionDataPoint[] => {
  // Pre-computed prediction values to avoid hydration mismatches
  const aqiValues = [
    167, 165, 160, 158, 155, 152, 148, 145, 142, 140,
    138, 135, 132, 130, 128, 125, 122, 120, 118, 116,
    114, 112, 110, 108, 106, 104, 102, 100, 98, 96,
    95, 94, 92, 91, 90, 89, 88, 87, 86, 85,
    84, 83, 82, 82, 81, 80, 80, 80, 79, 78,
    77, 76, 75, 75, 74, 74, 73, 73, 72, 72,
    71, 71, 70, 70, 69, 69, 68, 68, 67, 67,
    66, 66, 65, 65
  ];

  return aqiValues.map((aqi, i) => ({
    hour: i,
    aqi: aqi,
  }));
};

export const mockAQIData: AQIData = {
  city: "New Delhi",
  country: "India",
  lat: 28.6139,
  lng: 77.2090,
  aqi: 167,
  category: "Unhealthy",
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  pollutants: [
    { name: "Fine Particles", shortName: "PM2.5", value: 89, unit: "μg/m³", maxSafe: 35, icon: "particles" },
    { name: "Coarse Particles", shortName: "PM10", value: 142, unit: "μg/m³", maxSafe: 150, icon: "dust" },
    { name: "Nitrogen Dioxide", shortName: "NO₂", value: 48, unit: "ppb", maxSafe: 53, icon: "molecule" },
    { name: "Ozone", shortName: "O₃", value: 67, unit: "ppb", maxSafe: 70, icon: "ozone" },
    { name: "Carbon Monoxide", shortName: "CO", value: 1.2, unit: "ppm", maxSafe: 4.4, icon: "smoke" },
  ],
  trend: generateTrendData(),
  prediction: generatePrediction(),
  healthAdvisory: "Active children and adults, and people with respiratory disease, should avoid prolonged outdoor exertion. Everyone else should limit prolonged outdoor exertion.",
  lastUpdated: new Date(),
};

export const healthTips = [
  { icon: "mask", tip: "Wear an N95 mask outdoors to filter fine particles" },
  { icon: "home", tip: "Keep windows closed and use air purifiers indoors" },
  { icon: "activity", tip: "Avoid strenuous outdoor activities, especially during peak hours" },
  { icon: "droplets", tip: "Stay hydrated and consume antioxidant-rich foods" },
  { icon: "heart", tip: "Monitor symptoms if you have respiratory or heart conditions" },
];

export const citySuggestions = [
  "New Delhi, India",
  "Beijing, China",
  "Los Angeles, USA",
  "London, UK",
  "Tokyo, Japan",
  "Mumbai, India",
  "Shanghai, China",
  "Paris, France",
  "Sydney, Australia",
  "Dubai, UAE",
];
