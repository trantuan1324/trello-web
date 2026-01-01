import { Container } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar.jsx'
import BoardBar from './BoardBar/BoardBar.jsx'
import BoardContent from './BoardContent/BoardContent.jsx'
import { useState, useEffect } from 'react'
import { fetchBoardDetailsApi } from '~/apis/index.js'

export default function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '695684ece274818ce974bf27'
    // Call Api
    fetchBoardDetailsApi(boardId).then((board) => {
      setBoard(board)
    })
  }, [])

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} />
    </Container>
  )
}
