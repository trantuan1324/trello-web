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
  defaultDropAnimationSideEffects,
  closestCorners
} from '@dnd-kit/core'
import Card from './ListColumns/Column/ListCards/Card/Card'
import Column from './ListColumns/Column/Column'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { cloneDeep } from 'lodash'

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

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: 0.5
        }
      }
    })
  }

  const findColumnByCardId = (cardId) => {
    return orderedColumnsState.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    )
  }

  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setActiveDragItemData(event?.active?.data?.current)
  }

  const handleDragOver = (event) => {
    // không làm gì nếu item đang kéo là column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return
    }

    const { active, over } = event

    // kiểm tra đích, nếu kéo ra ngoài thì sẽ không cập nhật
    if (!over || !active) return

    // card đang được kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData }
    } = active

    // card ở trên hoặc dưới card đang được kéo
    const { id: overCardId } = over

    // tìm column của card đang kéo và 1 column mà card đó kéo sang
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // fix bug crash web khi không tồn tại 1 trong 2 column
    if (!activeColumn || !overColumn) return

    if (activeColumn._id !== overColumn._id) {
      setOrderedColumnsState((preColumn) => {
        // vị trí của của over card trong column đích mà card sẽ được thả
        const overCardIndex = overColumn?.cards?.findIndex((card) => {
          return card._id === overCardId
        })

        // logic để xác định vị trí mới của card
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0

        let newCardIndex =
          overCardIndex >= 0
            ? overCardIndex + modifier
            : overColumn?.cards?.length + 1

        // clone mảng orderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật orderedColumnsState mới
        const nextColumns = cloneDeep(preColumn)
        const nextActiveColumn = nextColumns.find(
          (column) => column._id === activeColumn._id
        )
        const nextOverColumn = nextColumns.find(
          (column) => column._id === overColumn._id
        )

        // column cũ
        if (nextActiveColumn) {
          // xóa card ở column active
          nextActiveColumn.cards = nextActiveColumn.cards.filter(
            (card) => card._id !== activeDraggingCardId
          )
          // cập nhật danh sách card mới tại column active
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
            (card) => card._id
          )
        }

        // column mới
        if (nextOverColumn) {
          // kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì xóa
          nextOverColumn.cards = nextOverColumn.cards.filter(
            (card) => card._id !== activeDraggingCardId
          )

          // thêm card đang kéo vào overColumn theo vị trị index mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(
            newCardIndex,
            0,
            activeDraggingCardData
          )

          // cập nhật danh sách card mới tại column over
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
            (card) => card._id
          )
        }

        return nextColumns
      })
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      return
    }

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
    console.log('handleDragEnd: ', event)

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      collisionDetection={closestCorners}
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
