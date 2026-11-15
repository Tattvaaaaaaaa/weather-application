
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

import { getWeatherInfo } from "./services/weatherService";

const DEFAULT_CITY = "Bhubaneswar";

function WeatherApp() {

  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const updateInfo = useCallback(async (city, signal) => {

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const data = await getWeatherInfo(trimmedCity, signal);

      if (signal?.aborted) {
        return;
      }

      setWeatherInfo(data);
      setLastUpdated(new Date());

    } catch (err) {

      if (err.name === "AbortError" || signal?.aborted) {
        return;
      }

      setWeatherInfo(null);
      setError(err.message || "Unable to retrieve weather information.");

    } finally {

      if (!signal?.aborted) {
        setLoading(false);
      }

    }

  }, []);

  // Load default city when application mounts

  useEffect(() => {

    const controller = new AbortController();

    updateInfo(DEFAULT_CITY, controller.signal);

    return () => {
      controller.abort();
    };

  }, [updateInfo]);

  return (

    <Container maxWidth="sm" sx={{ py: 6 }}>

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

      {/* Search */}

      <SearchBox
        onSearch={updateInfo}
        disabled={loading}
      />

      {/* Loading */}

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

      {/* API errors */}

      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mt: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Weather card */}

      {weatherInfo && !loading && (
        <InfoBox weatherInfo={weatherInfo} />
      )}

      {/* Last Updated */}

      {lastUpdated && weatherInfo && !loading && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "right",
            mt: 1.5
          }}
        >
          Last Updated: {lastUpdated.toLocaleString()}
        </Typography>
      )}

    </Container>

  );
}

export default WeatherApp;
