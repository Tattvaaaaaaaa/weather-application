
import { useState } from "react";

import {
  CssBaseline,
  Container,
  Typography,
  Alert
} from "@mui/material";

import SearchBox from "./components/SearchBox";
import ButtonTest from "./components/ButtonTest";

function App() {
  const [searchedCity, setSearchedCity] = useState("");

  const handleSearch = (city) => {
    setSearchedCity(city);
    console.log("City entered:", city);
  };

  return (
    <>
      <CssBaseline />

      <Container maxWidth="sm" sx={{ py: 6 }}>

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

        <SearchBox onSearch={handleSearch} />

        {searchedCity && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Successfully submitted search for{" "}
            <strong>{searchedCity}</strong>.

            Weather data will be connected in Module 3.
          </Alert>
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
