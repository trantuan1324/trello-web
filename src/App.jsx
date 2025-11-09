import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { AccessAlarm, ThreeDRotation } from '@mui/icons-material'

function App() {
  return (
    <>
      <h1>Rabbyte</h1>
      <Stack spacing={2} direction="row">
        <Button variant="text">Text</Button>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
      </Stack>
      <Stack spacing={2} direction="row">
        <AccessAlarm/>
        <ThreeDRotation/>
      </Stack>
    </>
  )
}

export default App
