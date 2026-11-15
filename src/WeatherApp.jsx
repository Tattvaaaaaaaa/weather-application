
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
  Box
} from "@mui/material";

import SearchBox from "./components/SearchBox";
import InfoBox from "./components/InfoBox";
import Forecast from "./components/Forecast";

import {
  getWeatherInfo,
  getFiveDayForecast
} from "./services/weatherService";

const DEFAULT_CITY = "Bhubaneswar";

function WeatherApp() {

  const [weatherInfo, setWeatherInfo] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecastError, setForecastError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  const updateInfo = useCallback(async (city, signal) => {

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setForecastError("");

    setWeatherInfo(null);
    setForecast([]);

    try {

      // Fetch current weather
      const data = await getWeatherInfo(
        trimmedCity,
        signal
      );

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
          "Current weather loaded, but forecast is unavailable: " +
          forecastErr.message
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
        err.message || "Unable to retrieve weather information."
      );

    } finally {

      if (!signal?.aborted) {
        setLoading(false);
      }

    }

  }, []);

  // Load the default city when application mounts
  useEffect(() => {

    const controller = new AbortController();

    updateInfo(DEFAULT_CITY, controller.signal);

    return () => {
      controller.abort();
    };

  }, [updateInfo]);

  return (

    <Container maxWidth="md" sx={{ py: 6 }}>

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

      {/* Search component */}

      <SearchBox
        onSearch={updateInfo}
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

      {/* Current weather error */}

      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mt: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Current weather card */}

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
