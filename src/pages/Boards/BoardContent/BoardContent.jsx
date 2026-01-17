import { Box } from '@mui/material'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  getFirstCollision,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibs/DndKitSensors.js'
import Card from './ListColumns/Column/ListCards/Card/Card'
import Column from './ListColumns/Column/Column'
import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatter'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'column',
  CARD: 'card'
}

export default function BoardContent({
  board,
  createNewColumn,
  createNewCard
}) {
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
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null)

  // điểm va chạm cuối cùng khi kéo thả card
  const lastOverId = useRef(null)

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

  // custom lại thuật phát hiện va chạm để khắc phục lỗi card flickering gây ra sai sót data khi kéo thả card (37)
  // https://github.com/clauderic/dnd-kit/blob/master/stories/2%20-%20Presets/Sortable/MultipleContainers.tsx#L195
  const collisionDetectionStrategy = useCallback(
    (args) => {
      // nếu kéo column thì sử dụng closestCorners
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args })
      }

      // tìm các điểm va chạm với con trỏ
      const pointerIntersections = pointerWithin(args)

      // https://github.com/clauderic/dnd-kit/issues/1213#issuecomment-1691708378 (37)
      // fix hoàn toàn (chắc thế) bug flickering khi kéo thả card ra khu vực
      // không ghi nhận va chạm với các thành phần khác tính trong vùng kéo thả
      if (!pointerIntersections?.length) return

      // thuật toán phát hiện va chạm trả về mảng các điểm va chạm
      // const intersections = !!pointerIntersections?.length
      //   ? pointerIntersections
      //   : rectIntersection(args)

      // tìm overId đầu tiên trong mảng pointerIntersections
      let overId = getFirstCollision(pointerIntersections, 'id')

      if (overId) {
        // nếu over là column thì việc tìm tới cardId gần nhất bên trong vùng va chạm dựa vào thuật toán phát hiện va chạm
        // closestCorners hay closestCenter đều đc
        const checkColumn = orderedColumnsState.find(
          (column) => column._id === overId
        )
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                checkColumn?.cardOrderIds?.includes(container.id)
            )
          })[0]?.id
        }

        lastOverId.current = overId
        return [{ id: overId }]
      }

      // nếu không có điểm va chạm nào thì trả về mảng rỗng tranhs crash trang
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeDragItemType, orderedColumnsState]
  )

  const findColumnByCardId = (cardId) => {
    return orderedColumnsState.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    )
  }

  const moveCardBetweenColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumnsState((preColumns) => {
      // vị trí của over card trong column đích mà card sẽ được thả
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
      const nextColumns = cloneDeep(preColumns)
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
        // Thêm placeholder card nếu column rỗng (37.2)
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

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
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        })

        // Xóa placeholder card nếu column over không rỗng
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        )

        // cập nhật danh sách card mới tại column over
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        )
      }

      console.log('nextColumns', nextColumns)
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    console.log(event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setActiveDragItemData(event?.active?.data?.current)

    // nếu item kéo là card thì mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
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
      moveCardBetweenColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    // xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
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

      // xem solution_img
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // kéo thả card giữa 2 column
        moveCardBetweenColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        // kéo thả card trong 1 column

        // lấy vị trí cũ (từ oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        )
        // lấy vị trí mới (từ over)
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        )

        let dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        )

        setOrderedColumnsState((preColumn) => {
          const nextColumn = cloneDeep(preColumn)

          // tìm tới column cần cập nhật
          const targetColumn = nextColumn.find(
            (column) => column._id === overColumn._id
          )

          // cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id)

          // trả về mảng mới với vị trí cards đã được cập nhật
          return nextColumn
        })
      }
    }

    // xử lý kéo thả column
    if (
      activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN &&
      active.id !== over.id
    ) {
      // lấy vị trí cũ (từ active)
      const oldColumnIndex = orderedColumnsState.findIndex(
        (c) => c._id === active.id
      )
      // lấy vị trí mới (từ over)
      const newColumnIndex = orderedColumnsState.findIndex(
        (c) => c._id === over.id
      )
      // dùng arrayMove để sắp xếp lại mảng
      const dndOrderedColumns = arrayMove(
        orderedColumnsState,
        oldColumnIndex,
        newColumnIndex
      )

      // Cập nhật lại toàn bộ mảng objects đã sắp xếp
      setOrderedColumnsState(dndOrderedColumns)
    }

    // những data sau khi kéo thả luôn phải đưa về giá trị mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  return (
    <DndContext
      sensors={sensors}
      // nếu chỉ dùng closestCorners thì sẽ xảy ra lỗi card flickering gây ra sai sót data khi kéo thả card (37)
      // https://github.com/clauderic/dnd-kit/issues/1128#issuecomment-1671336452
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
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
        <ListColumns
          columns={orderedColumnsState}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
        />
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
