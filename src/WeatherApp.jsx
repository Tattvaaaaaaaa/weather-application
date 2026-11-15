
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

import {
  getWeatherInfo,
  getWeatherByCoordinates,
  getFiveDayForecast
} from "./services/weatherService";

const DEFAULT_CITY = "Bhubaneswar";

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

// Convert browser location errors into readable messages
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

  // Central application state
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecastError, setForecastError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  // Common function for loading weather from any source
  const loadWeather = useCallback(async (weatherRequest, signal) => {

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

    return loadWeather(
      (requestSignal) => getWeatherInfo(city, requestSignal),
      signal
    );

  }, [loadWeather]);

  // NEW: Search using current browser location
  const handleUseLocation = useCallback(() => {

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    return loadWeather(async (signal) => {

      // Ask browser for permission and coordinates
      const position = await getCurrentPosition();

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log("Location coordinates received:", {
        latitude,
        longitude
      });

      // Fetch weather using those coordinates
      return getWeatherByCoordinates(
        latitude,
        longitude,
        signal
      );

    });

  }, [loadWeather]);

  // Load default city when the application opens
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

      {/* Geolocation button */}

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

      {/* Error alert */}

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

      {/* Timestamp */}

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
