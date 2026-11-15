
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Handle API responses

async function readResponse(response) {

  let data = {};

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response received from weather service.");
  }

  if (!response.ok) {

    if (response.status === 401) {
      throw new Error(
        "Invalid API key or API key not activated."
      );
    }

    if (response.status === 404) {
      throw new Error(
        "Weather information not found."
      );
    }

    if (response.status === 429) {
      throw new Error(
        "API request limit reached. Please try again later."
      );
    }

    throw new Error(
      data.message || `Weather request failed (${response.status}).`
    );
  }

  return data;
}

// Main weather function

export async function getWeatherInfo(city, signal) {

  if (!API_KEY) {
    throw new Error("OpenWeatherMap API key is missing.");
  }

  const trimmedCity = city.trim();

  if (!trimmedCity) {
    throw new Error("Please enter a valid city name.");
  }

  const requestOptions = signal ? { signal } : {};

  // STEP 1: Geocoding API

  const geoURL = new URL(
    "https://api.openweathermap.org/geo/1.0/direct"
  );

  geoURL.searchParams.set("q", trimmedCity);
  geoURL.searchParams.set("limit", "1");
  geoURL.searchParams.set("appid", API_KEY);

  const geoResponse = await fetch(
    geoURL,
    requestOptions
  );

  const locations = await readResponse(geoResponse);

  if (locations.length === 0) {
    throw new Error(
      "City not found. Please check the spelling."
    );
  }

  const location = locations[0];

  // STEP 2: Current Weather API

  const weatherURL = new URL(
    "https://api.openweathermap.org/data/2.5/weather"
  );

  weatherURL.searchParams.set("lat", location.lat);
  weatherURL.searchParams.set("lon", location.lon);
  weatherURL.searchParams.set("units", "metric");
  weatherURL.searchParams.set("appid", API_KEY);

  const weatherResponse = await fetch(
    weatherURL,
    requestOptions
  );

  const weatherData = await readResponse(weatherResponse);

  // STEP 3: Extract weather information

  const condition = weatherData.weather?.[0];

  if (!condition || !weatherData.main || !weatherData.sys) {
    throw new Error(
      "Weather information is incomplete."
    );
  }

  return {

    city: trimmedCity,
    country: weatherData.sys.country,

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
