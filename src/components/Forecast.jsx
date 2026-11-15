
import {
  Box,
  Card,
  CardContent,
  Typography
} from "@mui/material";

function Forecast({ forecast }) {

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>

      <Typography
        variant="h6"
        fontWeight={600}
        gutterBottom
      >
        5-Day Forecast
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(5, minmax(0, 1fr))"
          },
          gap: 1.5
        }}
      >

        {forecast.map((day) => (

          <Card
            key={day.date}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textAlign: "center",
              minWidth: 0
            }}
          >

            <CardContent
              sx={{
                p: 1.5,
                "&:last-child": {
                  pb: 1.5
                }
              }}
            >

              <Typography
                variant="subtitle2"
                fontWeight={600}
              >
                {day.dayLabel}
              </Typography>

              <Box
                component="img"
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
                sx={{
                  width: 55,
                  height: 55,
                  objectFit: "contain"
                }}
              />

              <Typography variant="h6" fontWeight={600}>
                {Math.round(day.temp)}°C
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°
              </Typography>

              <Typography
                variant="caption"
                display="block"
                sx={{
                  textTransform: "capitalize",
                  mt: 1
                }}
              >
                {day.description}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                Rain: {day.pop}%
              </Typography>

            </CardContent>

          </Card>

        ))}

      </Box>

    </Box>
  );
}

export default Forecast;
