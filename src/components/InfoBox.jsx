
import { useState } from "react";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Switch,
  Stack,
  FormControlLabel,
  Chip,
  Paper
} from "@mui/material";

import {
  WbSunny,
  AcUnit,
  Thunderstorm,
  Cloud,
  Grain
} from "@mui/icons-material";


// Select icon and background based on the weather
function getWeatherAppearance(weatherInfo) {

  const temperature = weatherInfo.temp;
  const condition = weatherInfo.main?.toLowerCase();

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
    background: "linear-gradient(135deg, #eef2f7, #e5ebf3)",
    iconColor: "#607080",
    label: "Current weather"
  };
}


function InfoBox({ weatherInfo }) {

  const [isFahrenheit, setIsFahrenheit] = useState(false);

  const appearance = getWeatherAppearance(weatherInfo);
  const WeatherIcon = appearance.Icon;

  const unit = isFahrenheit ? "°F" : "°C";

  const convertTemperature = (temperature) => {
    return isFahrenheit
      ? Math.round((temperature * 9 / 5) + 32)
      : Math.round(temperature);
  };

  const temperatureColor =
    weatherInfo.temp > 30
      ? "#c62828"
      : weatherInfo.temp < 10
        ? "#1565c0"
        : "#243247";

  const metrics = [
    {
      label: "Feels Like",
      value: `${convertTemperature(weatherInfo.feelsLike)}${unit}`
    },
    {
      label: "Minimum",
      value: `${convertTemperature(weatherInfo.tempMin)}${unit}`
    },
    {
      label: "Maximum",
      value: `${convertTemperature(weatherInfo.tempMax)}${unit}`
    },
    {
      label: "Humidity",
      value: `${weatherInfo.humidity}%`
    },
    {
      label: "Wind Speed",
      value: `${weatherInfo.windSpeed} m/s`
    }
  ];

  return (

    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.9)",
        background: appearance.background,
        boxShadow: "0 15px 40px rgba(31,57,92,0.07)"
      }}
    >

      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>

        {/* Main weather information */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >

          <Box>

            <Chip
              label="CURRENT WEATHER"
              size="small"
              sx={{
                mb: 2,
                fontWeight: 700,
                letterSpacing: 0.7,
                backgroundColor: "rgba(255,255,255,0.55)"
              }}
            />

            <Typography
              variant="h4"
              component="h2"
              fontWeight={750}
              sx={{ fontSize: { xs: "1.7rem", sm: "2rem" } }}
            >
              {weatherInfo.city}, {weatherInfo.country}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                textTransform: "capitalize",
                mt: 0.5
              }}
            >
              {weatherInfo.description}
            </Typography>

            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                mt: 2,
                color: temperatureColor,
                letterSpacing: -2,
                fontSize: { xs: "3.7rem", sm: "4.5rem" }
              }}
            >
              {convertTemperature(weatherInfo.temp)}{unit}
            </Typography>

          </Box>

          <Box
            sx={{
              alignSelf: { xs: "center", sm: "auto" },
              mr: { sm: 2 }
            }}
          >
            <WeatherIcon
              sx={{
                fontSize: { xs: 100, sm: 135 },
                color: appearance.iconColor
              }}
            />
          </Box>

        </Stack>

        <Divider sx={{ my: 3, borderColor: "rgba(40,60,90,0.12)" }} />


        {/* Temperature unit control */}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >

          <Typography variant="subtitle2" fontWeight={600}>
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


        {/* Weather metrics */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))"
            },
            gap: 1.5
          }}
        >

          {metrics.map((metric) => (

            <Paper
              key={metric.label}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor: "rgba(255,255,255,0.58)",
                border: "1px solid rgba(255,255,255,0.75)"
              }}
            >

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {metric.label}
              </Typography>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {metric.value}
              </Typography>

            </Paper>

          ))}

        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          Weather condition: {appearance.label}
        </Typography>

      </CardContent>

    </Card>

  );
}

export default InfoBox;
