import {
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  Typography
} from '@mui/material'
import {
  AddCard,
  Cloud,
  ContentCopy,
  ContentCut,
  ContentPaste,
  DeleteForever,
  DragHandle,
  MoreHoriz
} from '@mui/icons-material'
import MenuItem from '@mui/material/MenuItem'
import React from 'react'
import ListCards from './ListCards/ListCards'
import theme from '~/theme'
import { mapOrder } from '~/utils/sorts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function Column({ column }) {
  // drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column._id, data: { ...column } })
  const dndKitColumnStyle = {
    // nếu dùng CSS.Tranform thì khi kéo thả phần tử sẽ bị stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    // Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo
    // column ngắn qua một cái column dài thì phải kéo ở khu vực giữa
    // rất khó chịu (32).
    // Lưu ý lúc này phải kết hợp với {...listeners} nằm ở Box
    // chứ không phải ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh.
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  // dropdown menu
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  // order cards
  const orderedCards = mapOrder(column?.cards, column.cardOrderIds, '_id')

  return (
    // bọc lại với div để sửa bug khi kéo Column
    <div ref={setNodeRef} style={dndKitColumnStyle} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '300px',
          maxWidth: '300px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#333643' : '#ebecf0',
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)} )`
        }}
      >
        {/* Header */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {column.title}
          </Typography>
          <Box>
            <Tooltip title="More Options">
              <MoreHoriz
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                list: {
                  'aria-labelledby': 'basic-column-dropdown'
                }
              }}
            >
              <MenuItem>
                <ListItemIcon>
                  <AddCard fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <Cloud fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <DeleteForever fontSize="small" />
                </ListItemIcon>
                <ListItemText>Remove this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* List card */}
        <ListCards cards={orderedCards} />
        <Box
          sx={{
            height: theme.trello.columnFooterHeight,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button startIcon={<AddCard />}>Add new card</Button>
          <Tooltip title="Drag and drop to re-order">
            <DragHandle sx={{ cursor: 'pointer' }} />
          </Tooltip>
        </Box>
      </Box>
    </div>
  )
}
