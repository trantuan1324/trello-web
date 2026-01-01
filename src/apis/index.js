import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

export const fetchBoardDetailsApi = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  // kết quả trả về của axios là property tên data
  return response.data
}
