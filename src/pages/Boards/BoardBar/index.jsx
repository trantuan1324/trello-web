import { Box } from '@mui/material'

export default function BoardBar() {
  return (
    <Box
      sx={{
        backgroundColor: 'primary.dark',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        height: (theme) => theme.trello.boardBarHeight
      }}
    >
      Board bar
    </Box>
  )
}
