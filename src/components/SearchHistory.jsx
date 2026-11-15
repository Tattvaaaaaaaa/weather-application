
import {
  Box,
  Typography,
  Stack,
  Button
} from "@mui/material";

import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import HistoryIcon from "@mui/icons-material/History";

function SearchHistory({
  history,
  onSelect,
  onClear,
  disabled
}) {

  // Don't display the section when history is empty
  if (history.length === 0) {
    return null;
  }

  return (

    <Box sx={{ mt: 3 }}>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >

        <Stack direction="row" alignItems="center" spacing={1}>
          <HistoryIcon color="action" />

          <Typography variant="subtitle1" fontWeight={600}>
            Recent Searches
          </Typography>
        </Stack>

        <Button
          size="small"
          color="error"
          startIcon={<DeleteSweepIcon />}
          onClick={onClear}
          disabled={disabled}
        >
          Clear
        </Button>

      </Stack>

      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1}
      >

        {history.map((city) => (

          <Button
            key={city}
            variant="outlined"
            size="small"
            color="inherit"
            onClick={() => onSelect(city)}
            disabled={disabled}
            sx={{
              borderRadius: 5,
              textTransform: "none"
            }}
          >
            {city}
          </Button>

        ))}

      </Stack>

    </Box>

  );
}

export default SearchHistory;
