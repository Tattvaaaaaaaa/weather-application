
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;


async function readResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong with the API request."
        );
    }

    return data;
}


export async function getWeatherInfo(city) {

    if (!API_KEY) {
        throw new Error("OpenWeatherMap API key is missing.");
    }

    
    const geoURL = new URL(
        "https://api.openweathermap.org/geo/1.0/direct"
    );

    geoURL.searchParams.set("q", city);
    geoURL.searchParams.set("limit", "1");
    geoURL.searchParams.set("appid", API_KEY);

    const geoResponse = await fetch(geoURL);
    const locations = await readResponse(geoResponse);

    

    if (locations.length === 0) {
        throw new Error("City not found. Please try another city.");
    }

    const location = locations[0];

    

    const weatherURL = new URL(
        "https://api.openweathermap.org/data/2.5/weather"
    );

    weatherURL.searchParams.set("lat", location.lat);
    weatherURL.searchParams.set("lon", location.lon);
    weatherURL.searchParams.set("units", "metric");
    weatherURL.searchParams.set("appid", API_KEY);

    const weatherResponse = await fetch(weatherURL);
    const weatherData = await readResponse(weatherResponse);

    // STEP 3: Extract and organize useful information

    const result = {
        city: city.trim(),
        country: weatherData.sys.country,

        temp: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,

        tempMin: weatherData.main.temp_min,
        tempMax: weatherData.main.temp_max,

        humidity: weatherData.main.humidity,

        description: weatherData.weather[0].description,
        main: weatherData.weather[0].main,
        icon: weatherData.weather[0].icon,

        windSpeed: weatherData.wind.speed
    };

    return result;
}
