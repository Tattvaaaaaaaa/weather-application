
import {
  useState,
  useEffect,
  useCallback
} from "react";

import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Button
} from "@mui/material";

import MyLocationIcon from "@mui/icons-material/MyLocation";

import SearchBox from "./components/SearchBox";
import InfoBox from "./components/InfoBox";
import Forecast from "./components/Forecast";
import SearchHistory from "./components/SearchHistory";

import {
  getWeatherInfo,
  getWeatherByCoordinates,
  getFiveDayForecast
} from "./services/weatherService";

const DEFAULT_CITY = "Bhubaneswar";
const HISTORY_KEY = "weather-search-history";
const MAX_HISTORY = 5;


// Read saved history safely
function getSavedHistory() {

  try {

    const saved = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved
      .filter((city) => typeof city === "string" && city.trim())
      .slice(0, MAX_HISTORY);

  } catch {
    return [];
  }

}


// Get the user's browser location
function getCurrentPosition() {

  return new Promise((resolve, reject) => {

    if (!navigator.geolocation) {
      reject(
        new Error("Geolocation is not supported by this browser.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 300000
      }
    );

  });

}


// Convert location errors into readable messages
function getLocationError(error) {

  if (error.code === 1) {
    return "Location permission denied. Allow location access in your browser settings.";
  }

  if (error.code === 2) {
    return "Your location is currently unavailable.";
  }

  if (error.code === 3) {
    return "Location request timed out. Please try again.";
  }

  return error.message || "Unable to retrieve your location.";

}


function WeatherApp() {

  // Central weather state
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecastError, setForecastError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  // Load saved search history when component initializes
  const [searchHistory, setSearchHistory] = useState(
    getSavedHistory
  );


  // Save history whenever it changes
  useEffect(() => {

    try {

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(searchHistory)
      );

    } catch (err) {

      console.warn("Unable to save search history:", err);

    }

  }, [searchHistory]);


  // Add a successfully searched city to history
  const addToHistory = (city) => {

    const trimmedCity = city.trim();

    setSearchHistory((previousHistory) => {

      const filteredHistory = previousHistory.filter(
        (item) =>
          item.toLowerCase() !== trimmedCity.toLowerCase()
      );

      return [
        trimmedCity,
        ...filteredHistory
      ].slice(0, MAX_HISTORY);

    });

  };


  // Clear all recent searches
  const clearSearchHistory = () => {
    setSearchHistory([]);
  };


  // Common function for loading weather
  const loadWeather = useCallback(async (
    weatherRequest,
    signal,
    historyCity = ""
  ) => {

    setLoading(true);
    setError("");
    setForecastError("");

    setWeatherInfo(null);
    setForecast([]);

    try {

      // Fetch current weather
      const data = await weatherRequest(signal);

      if (signal?.aborted) {
        return;
      }

      setWeatherInfo(data);

      // Save city searches only after successful weather retrieval
      if (historyCity) {
        addToHistory(historyCity);
      }

      // Fetch five-day forecast
      try {

        const forecastData = await getFiveDayForecast(
          data.lat,
          data.lon,
          signal
        );

        if (signal?.aborted) {
          return;
        }

        setForecast(forecastData);

      } catch (forecastErr) {

        if (
          forecastErr.name === "AbortError" ||
          signal?.aborted
        ) {
          return;
        }

        setForecastError(
          "Forecast unavailable: " + forecastErr.message
        );

      }

      setLastUpdated(new Date());

    } catch (err) {

      if (
        err.name === "AbortError" ||
        signal?.aborted
      ) {
        return;
      }

      setWeatherInfo(null);
      setForecast([]);

      setError(
        err.code
          ? getLocationError(err)
          : err.message || "Unable to retrieve weather information."
      );

    } finally {

      if (!signal?.aborted) {
        setLoading(false);
      }

    }

  }, []);


  // Normal city search
  const updateInfo = useCallback((city, signal) => {

    const trimmedCity = city.trim();

    return loadWeather(
      (requestSignal) =>
        getWeatherInfo(trimmedCity, requestSignal),
      signal,
      trimmedCity
    );

  }, [loadWeather]);


  // Geolocation feature
  const handleUseLocation = useCallback(() => {

    if (!("geolocation" in navigator)) {

      setError("Geolocation is not supported by this browser.");
      return;

    }

    return loadWeather(async (signal) => {

      const position = await getCurrentPosition();

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log("Location received:", {
        latitude,
        longitude
      });

      return getWeatherByCoordinates(
        latitude,
        longitude,
        signal
      );

    });

  }, [loadWeather]);


  // Load default city when application mounts
  useEffect(() => {

    const controller = new AbortController();

    updateInfo(DEFAULT_CITY, controller.signal);

    return () => {
      controller.abort();
    };

  }, [updateInfo]);


  return (

    <Container maxWidth="md" sx={{ py: 6 }}>

      {/* Application heading */}

      <Typography
        variant="h4"
        component="h1"
        fontWeight={600}
        gutterBottom
      >
        Weather Application
      </Typography>

      <Typography color="text.secondary">
        Search for a city to explore its weather.
      </Typography>


      {/* City search */}

      <SearchBox
        onSearch={updateInfo}
        disabled={loading}
      />


      {/* Location button */}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<MyLocationIcon />}
        onClick={handleUseLocation}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        Use My Location
      </Button>


      {/* Search history */}

      <SearchHistory
        history={searchHistory}
        onSelect={updateInfo}
        onClear={clearSearchHistory}
        disabled={loading}
      />


      {/* Loading indicator */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 4
          }}
        >
          <CircularProgress />
        </Box>
      )}


      {/* Error notification */}

      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mt: 3 }}
        >
          {error}
        </Alert>
      )}


      {/* Current weather */}

      {weatherInfo && !loading && (
        <InfoBox weatherInfo={weatherInfo} />
      )}


      {/* Forecast error */}

      {forecastError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {forecastError}
        </Alert>
      )}


      {/* Five-day forecast */}

      {weatherInfo && !loading && (
        <Forecast forecast={forecast} />
      )}


      {/* Last updated */}

      {lastUpdated && weatherInfo && !loading && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "right",
            mt: 2
          }}
        >
          Last Updated: {lastUpdated.toLocaleString()}
        </Typography>
      )}

    </Container>

  );

}

export default WeatherApp;
