import { configureStore } from '@reduxjs/toolkit'
import folderSize from './folderSize'

export default configureStore({
  reducer: {
    fSize: folderSize,
  },
})