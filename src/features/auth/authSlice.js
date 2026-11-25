import { createSlice } from '@reduxjs/toolkit'

function loadSession() {
  const stored = window.sessionStorage.getItem('meeting-summarizer-session')
  if (!stored) return null

  try {
    const session = JSON.parse(stored)
    if (typeof session.access === 'string' && typeof session.refresh === 'string') {
      return session
    }
  } catch (error) {
    console.warn('The saved sign-in session was invalid and has been cleared.', error)
  }

  window.sessionStorage.removeItem('meeting-summarizer-session')
  return null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { session: loadSession() },
  reducers: {
    setSession(state, action) {
      state.session = action.payload
    },
    clearSession(state) {
      state.session = null
    },
  },
})

export const { setSession, clearSession } = authSlice.actions
export default authSlice.reducer
