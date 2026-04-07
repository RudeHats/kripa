import fetch from "node-fetch";

async function run() {
    const token = "8eb70a7316a6adf26fdc1238e30481f93590c300";
    const lat = 28.6139;
    const lng = 77.209;
    const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`;
    console.log("Fetching: ", url);
    
    try {
        const res = await fetch(url);
        const json = await res.json();
        console.log("JSON response:", JSON.stringify(json, null, 2));

        const { aqi, iaqi, city, time } = json.data;
        const pm25 = iaqi?.pm25?.v || 0;
        console.log("pm25:", pm25);
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
