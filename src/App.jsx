
import {
  CssBaseline,
  Container,
  Typography
} from "@mui/material";

import ButtonTest from "./components/ButtonTest";

function App() {
  return (
    <>
      <CssBaseline />

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Weather Application
        </Typography>

        <Typography color="text.secondary">
          Module 1: Material UI Fundamentals
        </Typography>

        <ButtonTest />
      </Container>
    </>
  );
}

export default App;
