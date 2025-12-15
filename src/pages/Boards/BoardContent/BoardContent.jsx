import { Box } from '@mui/material'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core'
import { useState } from 'react'
import { useEffect } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

export default function BoardContent({ board }) {
  // https://docs.dndkit.com/api-documentation/sensors
  // kiểm tra trước khi chạy handleDragEnd để tránh hàm bị gọi nhiều lần ngay cả khi chỉ click chuột (30)
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 }
  })

  // nhấn giữ 250ms và dung sai của cảm ứng (tolerance) là 500px thì mới active event
  // Tolerance nó đại diện cho khoảng cách (tính bằng pixel) của chuyển động được chấp nhận trước khi thao tác giữ và kéo (drag) bị hủy bỏ.
  // https://docs.dndkit.com/api-documentation/sensors/touch#delay
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 500
    }
  })
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumnsState, setOrderedColumnsState] = useState([])

  useEffect(() => {
    const orderedColumns = mapOrder(
      board?.columns,
      board?.columnOrderIds,
      '_id'
    )
    setOrderedColumnsState(orderedColumns)
  }, [board])
  const handleDragEnd = (event) => {
    const { active, over } = event

    // kiểm tra đích, nếu kéo ra ngoài thì sẽ không cập nhật
    if (!over) return

    if (active.id !== over.id) {
      // lấy vị trí cũ (từ active)
      const oldIndex = orderedColumnsState.findIndex((c) => c._id === active.id)
      // lấy vị trí mới (từ over)
      const newIndex = orderedColumnsState.findIndex((c) => c._id === over.id)
      // dùng arrayMove để sắp xếp lại mảng
      const dndOrderedColumns = arrayMove(
        orderedColumnsState,
        oldIndex,
        newIndex
      )

      // cập nhật vị trí sắp xếp sau khi kéo thả để lưu lại thứ tự mới vào db
      const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
      setOrderedColumnsState(dndOrderedColumns)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          height: (theme) => theme.trello.boardContentHeight,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumnsState} />
      </Box>
    </DndContext>
  )
}
