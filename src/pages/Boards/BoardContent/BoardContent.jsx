import { Box } from '@mui/material'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import Card from './ListColumns/Column/ListCards/Card/Card'
import Column from './ListColumns/Column/Column'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'column',
  CARD: 'card'
}

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

  // cùng một thời điểm chỉ có một item đang được kéo (card hoặc column)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    const orderedColumns = mapOrder(
      board?.columns,
      board?.columnOrderIds,
      '_id'
    )
    setOrderedColumnsState(orderedColumns)
  }, [board])

  const handleDragStart = (event) => {
    console.log('Drag start: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setActiveDragItemData(event?.active?.data?.current)
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: 0.5
        }
      }
    })
  }

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

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      sensors={sensors}
      onDragStart={handleDragStart}
    >
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
        <DragOverlay dropAnimation={dropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}
