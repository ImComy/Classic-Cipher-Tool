import { configureStore } from '@reduxjs/toolkit'
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import sessionReducer from './slices/sessionSlice'
import cipherReducer from './slices/cipherSlice'
import uiReducer from './slices/uiSlice'
import stepsReducer from './slices/stepsSlice'
import labReducer from './slices/labSlice'
import { persistenceMiddleware } from './middleware/persistence'

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    cipher: cipherReducer,
    ui: uiReducer,
    steps: stepsReducer,
    lab: labReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector