import { AQIData, TrendDataPoint, PredictionDataPoint, PollutantData } from "./aqi-data";

export async function fetchWAQIData(lat: number, lng: number): Promise<AQIData | null> {
    const token = process.env.NEXT_PUBLIC_WAQI_TOKEN;
    if (!token) return null;
    const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`;
    return _fetchAndTransformWAQI(url);
}

export async function fetchWAQIByCity(cityQuery: string): Promise<AQIData | null> {
    const token = process.env.NEXT_PUBLIC_WAQI_TOKEN;
    if (!token) return null;

    try {
        // Search for the keyword first to avoid "Unknown station"
        const searchUrl = `https://api.waqi.info/search/?keyword=${encodeURIComponent(cityQuery)}&token=${token}`;
        const searchRes = await fetch(searchUrl);
        const searchJson = await searchRes.json();

        if (searchJson.status === "ok" && searchJson.data && searchJson.data.length > 0) {
            // Take the first available station UID from search results
            const uid = searchJson.data[0].uid;
            const url = `https://api.waqi.info/feed/@${uid}/?token=${token}`;
            return _fetchAndTransformWAQI(url);
        }

        // Fallback to strict feed search if search endpoint fails or finds nothing
        const url = `https://api.waqi.info/feed/${encodeURIComponent(cityQuery)}/?token=${token}`;
        return _fetchAndTransformWAQI(url);
    } catch {
        return null;
    }
}

async function _fetchAndTransformWAQI(url: string): Promise<AQIData | null> {
    try {
        const res = await fetch(url);
        const json = await res.json();

        if (json.status !== "ok") {
            console.error("WAQI API Error:", json.data);
            return null;
        }

        const { aqi, iaqi, city, time } = json.data;

        // Map WAQI fields to our format
        const pm25 = iaqi.pm25?.v || 0;
        const pm10 = iaqi.pm10?.v || 0;
        const no2 = iaqi.no2?.v || 0;
        const o3 = iaqi.o3?.v || 0;
        const co = iaqi.co?.v || 0;

        const pollutants: PollutantData[] = [
            { name: "Fine Particles", shortName: "PM2.5", value: pm25, unit: "μg/m³", maxSafe: 35, icon: "particles" },
            { name: "Coarse Particles", shortName: "PM10", value: pm10, unit: "μg/m³", maxSafe: 150, icon: "dust" },
            { name: "Nitrogen Dioxide", shortName: "NO₂", value: no2, unit: "ppb", maxSafe: 53, icon: "molecule" },
            { name: "Ozone", shortName: "O₃", value: o3, unit: "ppb", maxSafe: 70, icon: "ozone" },
            { name: "Carbon Monoxide", shortName: "CO", value: co, unit: "ppm", maxSafe: 4.4, icon: "smoke" },
        ];

        // Helper for category
        const getCategory = (aqiValue: number) => {
            if (aqiValue <= 50) return "Good";
            if (aqiValue <= 100) return "Moderate";
            if (aqiValue <= 150) return "Unhealthy for Sensitive Groups";
            if (aqiValue <= 200) return "Unhealthy";
            if (aqiValue <= 300) return "Very Unhealthy";
            return "Hazardous";
        };

        const category = getCategory(aqi);

        // Provide a simple default health advisory based on category
        let healthAdvisory = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
        if (aqi > 50 && aqi <= 100) healthAdvisory = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.";
        if (aqi > 100 && aqi <= 150) healthAdvisory = "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
        if (aqi > 150 && aqi <= 200) healthAdvisory = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
        if (aqi > 200) healthAdvisory = "Health warnings of emergency conditions. The entire population is more likely to be affected.";

        // Generating dummy trend and prediction because free API tier doesn't always give it fully
        // We generate some localized dummy trend based on current AQI to keep UI working
        const trend: TrendDataPoint[] = [];
        for (let i = 0; i < 24; i++) {
            const hourStr = i.toString().padStart(2, '0');
            // Adding some artificial drift for the chart
            const mockValue = Math.round(Math.max(10, aqi + (Math.sin(i / 3) * 20)));
            trend.push({ time: `${hourStr}:00`, aqi: mockValue, hour: i });
        }

        const prediction: PredictionDataPoint[] = [];
        for (let i = 0; i < 72; i++) {
            prediction.push({ hour: i, aqi: Math.round(Math.max(10, aqi + (Math.cos(i / 5) * 15))) });
        }

        return {
            city: city.name || "Unknown Location",
            country: "",
            lat: city.geo ? city.geo[0] : undefined,
            lng: city.geo ? city.geo[1] : undefined,
            aqi,
            category,
            temperature: iaqi.t?.v || 20,
            humidity: iaqi.h?.v || 50,
            windSpeed: iaqi.w?.v || 5, // depending on API coverage
            pollutants,
            trend,
            prediction,
            healthAdvisory,
            lastUpdated: new Date(time.iso || Date.now()),
        };
    } catch (err) {
        console.error("Failed to fetch WAQI Data", err);
        return null;
    }
}
