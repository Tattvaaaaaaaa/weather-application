
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Divider
} from "@mui/material";

function InfoBox({ weatherInfo }) {

  // Change temperature colour according to the condition
  const temperatureColor =
    weatherInfo.temp > 30
      ? "error.main"
      : weatherInfo.temp < 10
        ? "info.main"
        : "text.primary";

  return (
    <Card
      sx={{
        mt: 4,
        borderRadius: 3,
        boxShadow: 3
      }}
    >
      <CardContent>

        {/* City and weather information */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Box>
            <Typography variant="h5">
              {weatherInfo.city}, {weatherInfo.country}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ textTransform: "capitalize" }}
            >
              {weatherInfo.description}
            </Typography>
          </Box>

          <CardMedia
            component="img"
            image={`https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`}
            alt={weatherInfo.description}
            sx={{
              width: 100,
              height: 100,
              objectFit: "contain"
            }}
          />
        </Box>

        {/* Main temperature */}

        <Typography
          variant="h2"
          sx={{
            color: temperatureColor,
            fontWeight: 600,
            mt: 1
          }}
        >
          {Math.round(weatherInfo.temp)}°C
        </Typography>

        <Typography color="text.secondary">
          Feels like {Math.round(weatherInfo.feelsLike)}°C
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Other weather information */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2
          }}
        >

          <Box>
            <Typography color="text.secondary" variant="body2">
              Minimum Temperature
            </Typography>

            <Typography variant="h6">
              {Math.round(weatherInfo.tempMin)}°C
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary" variant="body2">
              Maximum Temperature
            </Typography>

            <Typography variant="h6">
              {Math.round(weatherInfo.tempMax)}°C
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary" variant="body2">
              Humidity
            </Typography>

            <Typography variant="h6">
              {weatherInfo.humidity}%
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary" variant="body2">
              Wind Speed
            </Typography>

            <Typography variant="h6">
              {weatherInfo.windSpeed} m/s
            </Typography>
          </Box>

        </Box>

      </CardContent>
    </Card>
  );
}

export default InfoBox;
