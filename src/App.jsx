
import { useState } from "react";

import {
  CssBaseline,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box
} from "@mui/material";

import SearchBox from "./components/SearchBox";
import InfoBox from "./components/InfoBox";
import ButtonTest from "./components/ButtonTest";

import { getWeatherInfo } from "./services/weatherService";

function App() {
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (city) => {
    setLoading(true);
    setError("");
    setWeatherInfo(null);

    try {
      const data = await getWeatherInfo(city);

      setWeatherInfo(data);

      console.log("Weather information:", data);

    } catch (err) {
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />

      <Container maxWidth="sm" sx={{ py: 6 }}>

        {/* Application Heading */}

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
        >
          Weather Application
        </Typography>

        <Typography color="text.secondary">
          Search for a city to explore its weather.
        </Typography>

        {/* City Search Component */}

        <SearchBox onSearch={handleSearch} />

        {/* Loading Indicator */}

        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 3
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Error Message */}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {/* Weather Information Card */}

        {weatherInfo && (
          <InfoBox weatherInfo={weatherInfo} />
        )}

        {/* Material UI Button Practice */}

        <Typography
          variant="h6"
          sx={{ mt: 5 }}
        >
          Material UI Button Practice
        </Typography>

        <ButtonTest />

      </Container>
    </>
  );
}

export default App;
