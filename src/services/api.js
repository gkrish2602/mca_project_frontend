import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'
import { clearSession, setSession } from '../features/auth/authSlice'
import { showToast } from '../features/notifications/toastSlice'

const refreshMutex = new Mutex()

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.session?.access
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithRefresh = async (args, api, extraOptions) => {
  await refreshMutex.waitForUnlock()
  let result = await rawBaseQuery(args, api, extraOptions)
  const requestUrl = typeof args === 'string' ? args : args.url
  const canRefresh = !/auth\/(login|register|login\/refresh)\//.test(requestUrl)

  if (result.error?.status === 401 && canRefresh) {
    if (!refreshMutex.isLocked()) {
      const release = await refreshMutex.acquire()
      try {
        const refresh = api.getState().auth.session?.refresh
        if (!refresh) {
          api.dispatch(clearSession())
          return result
        }

        const refreshed = await rawBaseQuery(
          { url: 'auth/login/refresh/', method: 'POST', body: { refresh } },
          api,
          extraOptions,
        )

        if (refreshed.data?.access) {
          api.dispatch(setSession({
            access: refreshed.data.access,
            refresh: refreshed.data.refresh || refresh,
          }))
          result = await rawBaseQuery(args, api, extraOptions)
        } else {
          api.dispatch(clearSession())
        }
      } finally {
        release()
      }
    } else {
      await refreshMutex.waitForUnlock()
      result = await rawBaseQuery(args, api, extraOptions)
    }
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Me', 'Meeting', 'ActionItem', 'Email'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_credentials, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setSession(data))
          dispatch(showToast({ message: 'Welcome back. You’re signed in.', variant: 'success' }))
        } catch {
          // The rejected mutation is rendered by the login form.
        }
      },
    }),
    register: builder.mutation({
      query: (registration) => ({
        url: 'auth/register/',
        method: 'POST',
        body: registration,
      }),
      async onQueryStarted(_registration, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(showToast({ message: 'Your account has been created.', variant: 'success' }))
        } catch {
          // The rejected mutation is shown as a toast by the form.
        }
      },
    }),
    getMe: builder.query({
      query: () => 'auth/me/',
      providesTags: ['Me'],
    }),
    getMeetings: builder.query({
      query: () => 'meetings/',
      keepUnusedDataFor: 60,
      providesTags: (result) => [
        { type: 'Meeting', id: 'LIST' },
        ...(result?.results || result || []).map(({ id }) => ({ type: 'Meeting', id })),
      ],
    }),
    getMeeting: builder.query({
      query: (id) => `meetings/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Meeting', id }],
    }),
    retryMeeting: builder.mutation({
      query: (id) => ({
        url: `meetings/${id}/retry/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Meeting', id },
        { type: 'Meeting', id: 'LIST' },
      ],
    }),
    getAnalytics: builder.query({
      query: () => 'meetings/analytics/',
      providesTags: ['Meeting', 'ActionItem'],
    }),
    createMeeting: builder.mutation({
      query: (formData) => ({
        url: 'meetings/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Meeting', id: 'LIST' }],
      async onQueryStarted(_formData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(showToast({ message: 'Meeting saved. Processing has started.', variant: 'success' }))
        } catch {
          // The rejected mutation is shown as a toast by the meeting form.
        }
      },
    }),
    getActionItems: builder.query({
      query: () => 'action-items/',
      providesTags: (result) => [
        { type: 'ActionItem', id: 'LIST' },
        ...(result?.results || result || []).map(({ id }) => ({ type: 'ActionItem', id })),
      ],
    }),
    updateActionItem: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `action-items/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ActionItem', id },
        { type: 'ActionItem', id: 'LIST' },
        'Meeting',
      ],
      async onQueryStarted(_item, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(showToast({ message: 'Action item updated.', variant: 'success' }))
        } catch {
          // The rejected mutation is shown as a toast by the action-item page.
        }
      },
    }),
    draftFollowup: builder.mutation({
      query: (id) => ({
        url: `action-items/${id}/draft-followup/`,
        method: 'POST',
      }),
      invalidatesTags: ['Email'],
    }),
    updateEmailDraft: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `email-logs/${id}/edit/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Email', id }],
    }),
    sendEmailDraft: builder.mutation({
      query: (id) => ({
        url: `email-logs/${id}/send/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Email', id },
        'ActionItem',
      ],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetMeetingsQuery,
  useGetMeetingQuery,
  useRetryMeetingMutation,
  useGetAnalyticsQuery,
  useCreateMeetingMutation,
  useGetActionItemsQuery,
  useUpdateActionItemMutation,
  useDraftFollowupMutation,
  useUpdateEmailDraftMutation,
  useSendEmailDraftMutation,
} = api
