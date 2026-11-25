import { createSlice, nanoid } from '@reduxjs/toolkit'

const toastSlice = createSlice({
  name: 'toasts',
  initialState: { items: [] },
  reducers: {
    showToast: {
      reducer(state, action) {
        state.items.push(action.payload)
        if (state.items.length > 5) state.items.shift()
      },
      prepare({ message, variant = 'info' }) {
        return { payload: { id: nanoid(), message, variant } }
      },
    },
    dismissToast(state, action) {
      state.items = state.items.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { showToast, dismissToast } = toastSlice.actions
export default toastSlice.reducer
