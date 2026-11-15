
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Handle API responses and errors
async function readResponse(response) {

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong with the API request."
    );
  }

  return data;
}

// Fetch weather information for a city
export async function getWeatherInfo(city, signal) {

  if (!API_KEY) {
    throw new Error("OpenWeatherMap API key is missing.");
  }

  const trimmedCity = city.trim();

  if (!trimmedCity) {
    throw new Error("Please enter a valid city name.");
  }

  // STEP 1: Get geographical coordinates

  const geoURL = new URL(
    "https://api.openweathermap.org/geo/1.0/direct"
  );

  geoURL.searchParams.set("q", trimmedCity);
  geoURL.searchParams.set("limit", "1");
  geoURL.searchParams.set("appid", API_KEY);

  const requestOptions = signal ? { signal } : {};

  const geoResponse = await fetch(
    geoURL,
    requestOptions
  );

  const locations = await readResponse(geoResponse);

  if (locations.length === 0) {
    throw new Error("City not found. Please try another city.");
  }

  const location = locations[0];

  // STEP 2: Fetch current weather using coordinates

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

  // STEP 3: Extract the required weather information

  const condition = weatherData.weather?.[0];

  if (!condition) {
    throw new Error("Weather information is unavailable.");
  }

  const result = {

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

    windSpeed: weatherData.wind.speed

  };

  return result;
}
