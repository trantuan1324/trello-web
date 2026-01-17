import { Container } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar.jsx'
import BoardBar from './BoardBar/BoardBar.jsx'
import BoardContent from './BoardContent/BoardContent.jsx'
import { useState, useEffect } from 'react'
import {
  fetchBoardDetailsApi,
  createNewColumnApi,
  createNewCardApi
} from '~/apis/index.js'
import { generatePlaceholderCard } from '~/utils/formatter.js'
import { isEmpty } from 'lodash'

export default function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '695684ece274818ce974bf27'
    // Call Api
    fetchBoardDetailsApi(boardId).then((board) => {
      // khi refresh web cần xử lý kéo thả với column rỗng bằng các thêm placeholder card
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        }
      })
      setBoard(board)
    })
  }, [])

  // tạo mới một column và cập nhật lại state board
  const createNewColumn = async (newColumnData) => {
    // cập nhật state board
    const createdColumn = await createNewColumnApi({
      ...newColumnData,
      boardId: board._id
    })

    // khi tạo column mới cần xử lý kéo thả với column rỗng bằng các thêm placeholder card
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

    // cập nhật state board
    // phía client sẽ set lại state của board thay vì gọi api fetchBoardDetailsApi (mh ko thích gọi)
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }

  // tạo mới một card và cập nhật lại state board
  const createNewCard = async (newCardData) => {
    // cập nhật state board
    const createdCard = await createNewCardApi({
      ...newCardData,
      boardId: board._id
    })

    // cập nhật state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    )
    columnToUpdate.cards.splice(0, 1)
    columnToUpdate.cards.push(createdCard)
    columnToUpdate.cardOrderIds.push(createdCard._id)
    setBoard(newBoard)
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
      />
    </Container>
  )
}
