import { Box, Button } from '@mui/material'
import Column from './Column/Column'
import { NoteAdd } from '@mui/icons-material'
import {
  SortableContext,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable'

export default function ListColumns({ columns }) {
  // SortableContext yêu cầu item là mảng dạng ['id-1', 'id-2', ...] mà không phải dạng [{id: 'id-1', ...}]
  // nếu như là dạng list object thì chức năng kéo thả vẫn available nhưng sẽ không có hiệu ứng
  // https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512
  return (
    <SortableContext
      items={columns?.map((column) => column._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgcolor: 'inherit',
          width: '100%',
          height: '100%',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
      >
        {columns?.map((column) => {
          return <Column key={column._id} column={column} />
        })}

        {/* Add new column */}
        <Box
          sx={{
            minWidth: '200px',
            maxWidth: '200px',
            bgcolor: '#ffffff3d',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content'
          }}
        >
          <Button
            startIcon={<NoteAdd />}
            sx={{
              color: 'white',
              width: '100%',
              justifyContent: 'flex-start',
              pl: 2.5,
              py: 1
            }}
          >
            Add new column
          </Button>
        </Box>
      </Box>
    </SortableContext>
  )
}
