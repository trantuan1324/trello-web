import ModeSelector from "../ModeSelect/index.jsx";
import {Box} from "@mui/material";

function AppBar() {
  return (
    <Box
      sx={{
        backgroundColor: 'primary.light',
        width: '100%',
        height: (theme) => theme.trello.appBarHeight,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <ModeSelector/>
    </Box>
  )
}

export default AppBar;