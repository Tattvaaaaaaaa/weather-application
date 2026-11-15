
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

        <Typography variant="h4" component="h1" gutterBottom>
          Weather Application
        </Typography>

        <Typography color="text.secondary">
          Search for a city to explore its weather.
        </Typography>

        <SearchBox onSearch={handleSearch} />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {weatherInfo && (
          <Box sx={{ mt: 3 }}>

            <Alert severity="success">
              Weather found for {weatherInfo.city}, {weatherInfo.country}
            </Alert>

            <Typography sx={{ mt: 2 }}>
              Temperature: {weatherInfo.temp}°C
            </Typography>

            <Typography>
              Feels Like: {weatherInfo.feelsLike}°C
            </Typography>

            <Typography>
              Minimum Temperature: {weatherInfo.tempMin}°C
            </Typography>

            <Typography>
              Maximum Temperature: {weatherInfo.tempMax}°C
            </Typography>

            <Typography>
              Humidity: {weatherInfo.humidity}%
            </Typography>

            <Typography>
              Weather: {weatherInfo.description}
            </Typography>

            <Typography>
              Wind Speed: {weatherInfo.windSpeed} m/s
            </Typography>

          </Box>
        )}

        <Typography variant="h6" sx={{ mt: 5 }}>
          Material UI Button Practice
        </Typography>

        <ButtonTest />

      </Container>
    </>
  );
}

export default App;
