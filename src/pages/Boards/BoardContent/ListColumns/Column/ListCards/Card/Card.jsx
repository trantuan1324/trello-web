import {
  Button,
  Card as MuiCard,
  CardActions,
  CardContent,
  CardMedia,
  Typography
} from '@mui/material'
import { Attachment, Comment, Group } from '@mui/icons-material'
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import theme from '~/theme'

export default function Card({ card }) {
  const shouldShowCardAction = () => {
    return !!(
      card?.memberIds?.length ||
      card?.comments?.length ||
      card?.attachments?.length
    )
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card._id, data: { ...card } })
  const dndKitCardStyle = {
    // nếu dùng CSS.Tranform thì khi kéo thả phần tử sẽ bị stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  return (
    <MuiCard
      ref={setNodeRef}
      style={dndKitCardStyle}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'pointer',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        border: '1px solid transparent',
        borderRadius: '4px',
        '&:hover': {
          borderColor: (theme) => theme.palette.primary.main
        }
      }}
    >
      {card?.cover && <CardMedia sx={{ height: 140 }} image={card?.cover} />}

      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Typography>{card?.title}</Typography>
      </CardContent>
      {shouldShowCardAction() && (
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          {!!card?.memberIds?.length && (
            <Button size="small" startIcon={<Group />}>
              {card?.memberIds?.length}
            </Button>
          )}
          {!!card?.comments?.length && (
            <Button size="small" startIcon={<Comment />}>
              {card?.comments?.length}
            </Button>
          )}
          {!!card?.attachments?.length && (
            <Button size="small" startIcon={<Attachment />}>
              {card?.attachments?.length}
            </Button>
          )}
        </CardActions>
      )}
    </MuiCard>
  )
}
