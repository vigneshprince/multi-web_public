import { createSlice } from '@reduxjs/toolkit'

export const folderSize = createSlice({
  name: 'fSize',
  initialState: {
    value: 0,
  },
  reducers: {
    setfolderSize: (state, action) => {
      state.value = action.payload
    }
  }
})

export const { setfolderSize } = folderSize.actions

export default folderSize.reducer