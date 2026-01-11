import {Box} from '@mui/material'
import React from 'react'
import theme from '~/theme'
import Card from './Card/Card'
import {SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable'

export default function ListCards({cards}) {
  return (
    <SortableContext
      items={cards?.map((card) => card._id)}
      strategy={verticalListSortingStrategy}
    >
      <Box
        sx={{
          p: '0 5px 10px 5px',
          m: '0 5px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowX: 'hidden',
          overflowY: 'auto',
          maxHeight: () =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)} - ${theme.trello.columnHeaderHeight} - ${theme.trello.columnFooterHeight})`
        }}
      >
        {cards?.map((card) => {
          return <Card key={card._id} card={card}/>
        })}
      </Box>
    </SortableContext>
  )
}
