
import { Button, Stack } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

function ButtonTest() {
  return (
    <Stack direction="row" spacing={2} sx={{ mt: 4 }}>

      <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
      >
        Delete
      </Button>

      <Button
        variant="contained"
        color="success"
        startIcon={<SendIcon />}
      >
        Submit
      </Button>

      <Button
        variant="outlined"
        disabled
      >
        Disabled
      </Button>

    </Stack>
  );
}

export default ButtonTest;
