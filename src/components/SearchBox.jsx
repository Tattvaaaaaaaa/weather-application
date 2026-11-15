
import { useState } from "react";

import {
  TextField,
  Button,
  Stack
} from "@mui/material";

function SearchBox({ onSearch }) {

  const [city, setCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trimmedCity = city.trim();

  const hasError =
    (submitted || city.length > 0) &&
    trimmedCity.length < 2;

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    if (trimmedCity.length < 2) {
      return;
    }

    onSearch(trimmedCity);
  };

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit}
      sx={{ mt: 4 }}
    >
      <TextField
        label="City"
        placeholder="e.g. Bhubaneswar"
        variant="outlined"
        fullWidth
        value={city}
        onChange={(event) => {
          setCity(event.target.value);
          setSubmitted(false);
        }}
        error={hasError}
        helperText={
          hasError
            ? "Please enter at least 2 characters."
            : "Enter a city name to check its weather."
        }
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
      >
        Search Weather
      </Button>

    </Stack>
  );
}

export default SearchBox;
