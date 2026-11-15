
import { useState } from "react";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Switch,
  Stack,
  FormControlLabel
} from "@mui/material";

import {
  WbSunny,
  AcUnit,
  Thunderstorm,
  Cloud,
  Grain
} from "@mui/icons-material";

// Select icon and background according to weather
function getWeatherAppearance(weatherInfo) {

  const temperature = weatherInfo.temp;
  const condition = weatherInfo.main?.toLowerCase();

  // Special winter condition from the project exercise
  if (temperature <= 0) {
    return {
      Icon: AcUnit,
      background: "linear-gradient(135deg, #dff4ff, #effaff)",
      iconColor: "#168ac4",
      label: "Freezing conditions"
    };
  }

  if (condition === "thunderstorm") {
    return {
      Icon: Thunderstorm,
      background: "linear-gradient(135deg, #dce1ed, #b8c2d8)",
      iconColor: "#424d67",
      label: "Thunderstorm"
    };
  }

  if (condition === "snow") {
    return {
      Icon: AcUnit,
      background: "linear-gradient(135deg, #e5f3ff, #f6fbff)",
      iconColor: "#2589c5",
      label: "Snow"
    };
  }

  if (condition === "rain" || condition === "drizzle") {
    return {
      Icon: Grain,
      background: "linear-gradient(135deg, #dce9f3, #edf4f8)",
      iconColor: "#39769d",
      label: "Rain"
    };
  }

  if (condition === "clouds") {
    return {
      Icon: Cloud,
      background: "linear-gradient(135deg, #edf0f5, #dce4ed)",
      iconColor: "#607080",
      label: "Cloudy"
    };
  }

  if (condition === "clear") {
    return {
      Icon: WbSunny,
      background: "linear-gradient(135deg, #fff3cf, #fffbea)",
      iconColor: "#e6a329",
      label: "Clear sky"
    };
  }

  return {
    Icon: Cloud,
    background: "#f1f5f9",
    iconColor: "#607080",
    label: "Current weather"
  };
}

function InfoBox({ weatherInfo }) {

  const [isFahrenheit, setIsFahrenheit] = useState(false);

  const appearance = getWeatherAppearance(weatherInfo);

  const WeatherIcon = appearance.Icon;

  const unit = isFahrenheit ? "°F" : "°C";

  // Convert Celsius into Fahrenheit for display
  const convertTemperature = (temperature) => {

    if (isFahrenheit) {
      return Math.round((temperature * 9 / 5) + 32);
    }

    return Math.round(temperature);
  };

  // Temperature text colour
  const temperatureColor =
    weatherInfo.temp > 30
      ? "#d32f2f"
      : weatherInfo.temp < 10
        ? "#1976d2"
        : "#263238";

  return (

    <Card
      sx={{
        mt: 4,
        borderRadius: 3,
        boxShadow: 3,
        background: appearance.background,
        transition: "background 0.3s ease"
      }}
    >

      <CardContent sx={{ p: 3 }}>

        {/* City and weather information */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >

          <Box>

            <Typography variant="h5" fontWeight={600}>
              {weatherInfo.city}, {weatherInfo.country}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ textTransform: "capitalize" }}
            >
              {weatherInfo.description}
            </Typography>

          </Box>

          <WeatherIcon
            sx={{
              fontSize: 75,
              color: appearance.iconColor
            }}
          />

        </Stack>

        {/* Current temperature */}

        <Typography
          variant="h2"
          fontWeight={700}
          sx={{
            color: temperatureColor,
            mt: 2
          }}
        >
          {convertTemperature(weatherInfo.temp)}{unit}
        </Typography>

        <Typography color="text.secondary">
          Feels like {convertTemperature(weatherInfo.feelsLike)}{unit}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Celsius / Fahrenheit toggle */}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >

          <Typography variant="body2" fontWeight={500}>
            Temperature Unit
          </Typography>

          <FormControlLabel
            sx={{ mr: 0 }}
            label={isFahrenheit ? "Fahrenheit" : "Celsius"}
            control={
              <Switch
                checked={isFahrenheit}
                onChange={(event) =>
                  setIsFahrenheit(event.target.checked)
                }
                color="primary"
                inputProps={{
                  "aria-label": "Toggle Fahrenheit temperature"
                }}
              />
            }
          />

        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Other weather information */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2
          }}
        >

          <Box>
            <Typography variant="body2" color="text.secondary">
              Minimum Temperature
            </Typography>

            <Typography variant="h6">
              {convertTemperature(weatherInfo.tempMin)}{unit}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Maximum Temperature
            </Typography>

            <Typography variant="h6">
              {convertTemperature(weatherInfo.tempMax)}{unit}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Humidity
            </Typography>

            <Typography variant="h6">
              {weatherInfo.humidity}%
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Wind Speed
            </Typography>

            <Typography variant="h6">
              {weatherInfo.windSpeed} m/s
            </Typography>
          </Box>

        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 3 }}
        >
          Weather condition: {appearance.label}
        </Typography>

      </CardContent>

    </Card>

  );
}

export default InfoBox;
