import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import { api } from '../services/api'
import authReducer, { clearSession, setSession } from '../features/auth/authSlice'
import toastReducer from '../features/notifications/toastSlice'

const sessionListener = createListenerMiddleware()

sessionListener.startListening({
  actionCreator: setSession,
  effect: (action) => {
    window.sessionStorage.setItem('meeting-summarizer-session', JSON.stringify(action.payload))
  },
})

sessionListener.startListening({
  actionCreator: clearSession,
  effect: (_action, { dispatch }) => {
    window.sessionStorage.removeItem('meeting-summarizer-session')
    dispatch(api.util.resetApiState())
  },
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toasts: toastReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sessionListener.middleware, api.middleware),
})
