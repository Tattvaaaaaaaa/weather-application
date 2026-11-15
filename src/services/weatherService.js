
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Handle API responses and errors
async function readResponse(response) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from weather service.");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid API key or API key not activated.");
    }

    if (response.status === 404) {
      throw new Error("Weather information not found.");
    }

    if (response.status === 429) {
      throw new Error("API request limit reached.");
    }

    throw new Error(
      data.message || `Request failed: ${response.status}`
    );
  }

  return data;
}


// Shared function for fetching current weather using coordinates
async function fetchWeatherByCoordinates(
  lat,
  lon,
  cityLabel = "",
  signal
) {
  const weatherURL = new URL(
    "https://api.openweathermap.org/data/2.5/weather"
  );

  weatherURL.searchParams.set("lat", lat);
  weatherURL.searchParams.set("lon", lon);
  weatherURL.searchParams.set("units", "metric");
  weatherURL.searchParams.set("appid", API_KEY);

  const response = await fetch(
    weatherURL,
    signal ? { signal } : {}
  );

  const weatherData = await readResponse(response);

  const condition = weatherData.weather?.[0];

  if (!condition || !weatherData.main || !weatherData.sys) {
    throw new Error("Incomplete weather information received.");
  }

  return {
    city: cityLabel || weatherData.name || "Your location",
    country: weatherData.sys.country,

    lat: Number(lat),
    lon: Number(lon),

    temp: weatherData.main.temp,
    feelsLike: weatherData.main.feels_like,

    tempMin: weatherData.main.temp_min,
    tempMax: weatherData.main.temp_max,

    humidity: weatherData.main.humidity,

    description: condition.description,
    main: condition.main,
    icon: condition.icon,

    windSpeed: weatherData.wind?.speed ?? 0
  };
}


// Get weather using a city name
export async function getWeatherInfo(city, signal) {
  if (!API_KEY) {
    throw new Error("OpenWeatherMap API key is missing.");
  }

  const trimmedCity = city.trim();

  if (!trimmedCity) {
    throw new Error("Please enter a valid city name.");
  }

  // First: Convert city name into coordinates
  const geoURL = new URL(
    "https://api.openweathermap.org/geo/1.0/direct"
  );

  geoURL.searchParams.set("q", trimmedCity);
  geoURL.searchParams.set("limit", "1");
  geoURL.searchParams.set("appid", API_KEY);

  const geoResponse = await fetch(
    geoURL,
    signal ? { signal } : {}
  );

  const locations = await readResponse(geoResponse);

  if (locations.length === 0) {
    throw new Error("City not found. Check the spelling.");
  }

  const location = locations[0];

  // Second: Fetch weather with the coordinates
  return fetchWeatherByCoordinates(
    location.lat,
    location.lon,
    trimmedCity,
    signal
  );
}


// NEW: Get weather using browser coordinates
export async function getWeatherByCoordinates(lat, lon, signal) {
  if (!API_KEY) {
    throw new Error("OpenWeatherMap API key is missing.");
  }

  return fetchWeatherByCoordinates(
    lat,
    lon,
    "",
    signal
  );
}


// Get five-day weather forecast
export async function getFiveDayForecast(lat, lon, signal) {
  if (!API_KEY) {
    throw new Error("OpenWeatherMap API key is missing.");
  }

  const forecastURL = new URL(
    "https://api.openweathermap.org/data/2.5/forecast"
  );

  forecastURL.searchParams.set("lat", lat);
  forecastURL.searchParams.set("lon", lon);
  forecastURL.searchParams.set("units", "metric");
  forecastURL.searchParams.set("appid", API_KEY);

  const response = await fetch(
    forecastURL,
    signal ? { signal } : {}
  );

  const forecastData = await readResponse(response);

  // Group forecast records by the city's local date
  const timezoneOffset = forecastData.city?.timezone ?? 0;
  const dailyGroups = new Map();

  forecastData.list.forEach((item) => {
    const localDate = new Date(
      (item.dt + timezoneOffset) * 1000
    ).toISOString().slice(0, 10);

    if (!dailyGroups.has(localDate)) {
      dailyGroups.set(localDate, []);
    }

    dailyGroups.get(localDate).push(item);
  });

  // Produce daily summaries
  const dailyForecast = Array.from(dailyGroups.entries())
    .slice(0, 5)
    .map(([date, entries]) => {

      const representative = entries.reduce((best, item) => {
        const itemHour = new Date(
          (item.dt + timezoneOffset) * 1000
        ).getUTCHours();

        const bestHour = new Date(
          (best.dt + timezoneOffset) * 1000
        ).getUTCHours();

        return Math.abs(itemHour - 12) <
          Math.abs(bestHour - 12)
          ? item
          : best;
      }, entries[0]);

      const temperatures = entries.map(
        (item) => item.main.temp
      );

      const weather = representative.weather?.[0];

      const dateObject = new Date(`${date}T12:00:00Z`);

      const dayLabel = new Intl.DateTimeFormat(
        undefined,
        {
          weekday: "short",
          month: "short",
          day: "numeric",
          timeZone: "UTC"
        }
      ).format(dateObject);

      return {
        date,
        dayLabel,

        temp: representative.main.temp,
        tempMin: Math.min(...temperatures),
        tempMax: Math.max(...temperatures),

        description: weather?.description ?? "Unavailable",
        main: weather?.main ?? "Unknown",
        icon: weather?.icon ?? "01d",

        pop: Math.round(
          Math.max(
            ...entries.map((item) => item.pop ?? 0)
          ) * 100
        )
      };
    });

  return dailyForecast;
}
