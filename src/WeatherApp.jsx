
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
  Button,
  Paper,
  Stack,
  Chip
} from "@mui/material";

import MyLocationIcon from "@mui/icons-material/MyLocation";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";

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
      .filter(
        (city) => typeof city === "string" && city.trim()
      )
      .slice(0, MAX_HISTORY);

  } catch {
    return [];
  }
}


// Get the current browser location
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
    return "Location permission denied. Allow access in browser settings.";
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forecastError, setForecastError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  const [searchHistory, setSearchHistory] = useState(
    getSavedHistory
  );


  // Save history in localStorage
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


  // Add successfully searched cities to history
  const addToHistory = useCallback((city) => {

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

  }, []);


  // Clear search history
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

      const data = await weatherRequest(signal);

      if (signal?.aborted) {
        return;
      }

      setWeatherInfo(data);

      if (historyCity) {
        addToHistory(historyCity);
      }

      setLastUpdated(new Date());

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

  }, [addToHistory]);


  // Search using city name
  const updateInfo = useCallback((city, signal) => {

    const trimmedCity = city.trim();

    return loadWeather(
      (requestSignal) =>
        getWeatherInfo(trimmedCity, requestSignal),
      signal,
      trimmedCity
    );

  }, [loadWeather]);


  // Search using current location
  const handleUseLocation = useCallback(() => {

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    return loadWeather(async (signal) => {

      const position = await getCurrentPosition();

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      return getWeatherByCoordinates(
        latitude,
        longitude,
        signal
      );

    });

  }, [loadWeather]);


  // Load default city when application mounts
  // The state updates happen after asynchronous requests,
  // avoiding synchronous state updates inside the effect.
  useEffect(() => {

    const controller = new AbortController();

    async function loadDefaultWeather() {

      try {

        // Fetch default city's current weather
        const data = await getWeatherInfo(
          DEFAULT_CITY,
          controller.signal
        );

        if (controller.signal.aborted) {
          return;
        }

        setWeatherInfo(data);
        addToHistory(DEFAULT_CITY);
        setLastUpdated(new Date());

        // Fetch its five-day forecast
        try {

          const forecastData = await getFiveDayForecast(
            data.lat,
            data.lon,
            controller.signal
          );

          if (controller.signal.aborted) {
            return;
          }

          setForecast(forecastData);

        } catch (forecastErr) {

          if (
            forecastErr.name === "AbortError" ||
            controller.signal.aborted
          ) {
            return;
          }

          setForecastError(
            "Forecast unavailable: " + forecastErr.message
          );

        }

      } catch (err) {

        if (
          err.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        setWeatherInfo(null);
        setForecast([]);

        setError(
          err.message || "Unable to retrieve weather information."
        );

      } finally {

        if (!controller.signal.aborted) {
          setLoading(false);
        }

      }

    }

    loadDefaultWeather();

    return () => {
      controller.abort();
    };

  }, [addToHistory]);


  return (

    <Box sx={{ minHeight: "100vh", py: { xs: 3, md: 6 } }}>

      <Container maxWidth="lg">

        {/* Dashboard heading */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 4 }}
        >

          <Box>

            <Stack direction="row" alignItems="center" spacing={1}>

              <CloudQueueIcon
                sx={{ fontSize: 30, color: "#3979d5" }}
              />

              <Typography
                variant="overline"
                color="primary"
                fontWeight={700}
                letterSpacing={2}
              >
                WEATHER DASHBOARD
              </Typography>

            </Stack>

            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              sx={{
                mt: 1,
                fontSize: {
                  xs: "2rem",
                  md: "2.7rem"
                }
              }}
            >
              Weather, at a glance.
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Current conditions and the forecast for your next five days.
            </Typography>

          </Box>

          <Chip
            label="Live Weather"
            color="success"
            variant="outlined"
            sx={{
              fontWeight: 600,
              px: 1,
              py: 2
            }}
          />

        </Stack>


        {/* Search panel */}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 4,
            border: "1px solid #e3eaf4",
            backgroundColor: "rgba(255,255,255,0.9)",
            boxShadow: "0 12px 35px rgba(31, 57, 92, 0.05)"
          }}
        >

          <Typography variant="h6" fontWeight={700}>
            Find a location
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Enter a city or use your current location.
          </Typography>

          <SearchBox
            onSearch={updateInfo}
            disabled={loading}
          />

          <Button
            fullWidth
            variant="outlined"
            startIcon={<MyLocationIcon />}
            onClick={handleUseLocation}
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600
            }}
          >
            Use My Location
          </Button>

          <SearchHistory
            history={searchHistory}
            onSelect={updateInfo}
            onClear={clearSearchHistory}
            disabled={loading}
          />

        </Paper>


        {/* Loading indicator */}

        {loading && (
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 4,
              borderRadius: 3,
              border: "1px solid #e3eaf4",
              textAlign: "center"
            }}
          >

            <CircularProgress />

            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ mt: 2 }}
            >
              Fetching weather information...
            </Typography>

          </Paper>
        )}


        {/* Main API error */}

        {error && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ mt: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}


        {/* Current weather and forecast */}

        {weatherInfo && !loading && (

          <Box sx={{ mt: 4 }}>

            <InfoBox weatherInfo={weatherInfo} />

            {forecastError && (
              <Alert
                severity="warning"
                sx={{ mt: 2, borderRadius: 2 }}
              >
                {forecastError}
              </Alert>
            )}

            <Forecast forecast={forecast} />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                textAlign: "right",
                mt: 2
              }}
            >
              Last updated: {lastUpdated?.toLocaleString()}
            </Typography>

          </Box>

        )}


        {/* Footer */}

        <Box
          sx={{
            textAlign: "center",
            mt: 6,
            pt: 3,
            borderTop: "1px solid #dfe6ef"
          }}
        >

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Weather information powered by OpenWeatherMap
          </Typography>

        </Box>

      </Container>

    </Box>

  );

}

export default WeatherApp;
