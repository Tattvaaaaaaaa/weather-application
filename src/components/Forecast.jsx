
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack
} from "@mui/material";

import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";

function Forecast({ forecast }) {

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (

    <Box sx={{ mt: 4 }}>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >

        <Box>

          <Typography
            variant="h5"
            fontWeight={750}
          >
            5-Day Forecast
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            A look at the weather ahead.
          </Typography>

        </Box>

        <WbSunnyOutlinedIcon
          sx={{
            fontSize: 30,
            color: "#d99b27"
          }}
        />

      </Stack>


      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
            md: "repeat(5, minmax(0, 1fr))"
          },
          gap: 1.5
        }}
      >

        {forecast.map((day, index) => (

          <Card
            key={day.date}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #e5eaf2",
              backgroundColor: index === 0 ? "#edf4ff" : "#ffffff",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",

              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 10px 25px rgba(35,65,105,0.09)"
              }
            }}
          >

            <CardContent
              sx={{
                p: 2,
                textAlign: "center",
                "&:last-child": {
                  pb: 2
                }
              }}
            >

              <Typography
                variant="subtitle2"
                fontWeight={700}
              >
                {day.dayLabel}
              </Typography>

              <Box
                component="img"
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                alt={day.description}
                sx={{
                  width: 75,
                  height: 75,
                  objectFit: "contain",
                  display: "block",
                  mx: "auto",
                  my: 0.5
                }}
              />

              <Typography
                variant="h5"
                fontWeight={750}
              >
                {Math.round(day.temp)}°
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°C
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  textTransform: "capitalize",
                  mt: 1,
                  minHeight: 36
                }}
              >
                {day.description}
              </Typography>

              <Box
                sx={{
                  mt: 1.5,
                  pt: 1,
                  borderTop: "1px solid #e9edf3"
                }}
              >

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Rain probability
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="primary"
                >
                  {day.pop}%
                </Typography>

              </Box>

            </CardContent>

          </Card>

        ))}

      </Box>

    </Box>

  );
}

export default Forecast;
