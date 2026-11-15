
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

// Default city shown when the application opens
const DEFAULT_CITY = "Bhubaneswar";

function WeatherApp() {

  // Central application state
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function responsible for fetching and updating weather
  const updateInfo = useCallback(async (city, signal) => {

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      return;
    }

    setLoading(true);
    setError("");
    setWeatherInfo(null);

    try {

      const data = await getWeatherInfo(trimmedCity, signal);

      // Ignore results from cancelled requests
      if (signal?.aborted) {
        return;
      }

      setWeatherInfo(data);
      setLastUpdated(new Date());

    } catch (err) {

      // Cancellation is not an application error
      if (err.name !== "AbortError") {
        setError(err.message || "Unable to fetch weather.");
      }

    } finally {

      if (!signal?.aborted) {
        setLoading(false);
      }

    }

  }, []);

  // Load the default city when the component mounts
  useEffect(() => {

    const controller = new AbortController();

    updateInfo(DEFAULT_CITY, controller.signal);

    // Cancel the request if the component unmounts
    return () => {
      controller.abort();
    };

  }, [updateInfo]);

  return (

    <Container maxWidth="sm" sx={{ py: 6 }}>

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

      {/* Error message */}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {/* Weather information */}

      {weatherInfo && (
        <InfoBox weatherInfo={weatherInfo} />
      )}

      {/* Last updated timestamp */}

      {lastUpdated && weatherInfo && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "right",
            mt: 1.5
          }}
        >
          Last updated: {lastUpdated.toLocaleString()}
        </Typography>
      )}

    </Container>

  );
}

export default WeatherApp;
