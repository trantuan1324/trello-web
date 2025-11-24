import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { AccessAlarm, ThreeDRotation } from "@mui/icons-material";
import { useColorScheme } from "@mui/material/styles";

function ModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button
      onClick={() => {
        setMode(mode === "light" ? "dark" : "light");
        // localStorage.setItem("app-theme", mode);
        // localStorage.getItem("app-theme");
      }}
    >
      {mode === "light" ? "Turn dark" : "Turn light"}
    </Button>
  );
}

function App() {
  return (
    <>
      <ModeToggle />
      <h1>Rabbyte</h1>
      <Stack spacing={2} direction="row">
        <Button variant="text">Text</Button>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
      </Stack>
      <Stack direction={"row"} spacing={2}>
        <AccessAlarm />
        <ThreeDRotation />
      </Stack>
    </>
  );
}

export default App;
