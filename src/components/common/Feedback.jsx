import { useEffect } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { showToast } from '../../features/notifications/toastSlice'

function getErrorMessage(error) {
  if (typeof error.data?.detail === 'string') return error.data.detail
  const fieldMessages = Object.values(error.data || {})
    .flat()
    .filter((message) => typeof message === 'string')
  return fieldMessages.join(' ') || error.error || 'Something went wrong. Please try again.'
}

export function ErrorToast({ error, onRetry }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (error) dispatch(showToast({ message: getErrorMessage(error), variant: 'danger' }))
  }, [dispatch, error])

  if (!error) return null

  return (
    onRetry && <button className="btn btn-sm btn-outline-secondary my-2" onClick={onRetry}>Try again</button>
  )
}

export function EmptyState({ icon = 'bi-inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <span className={`empty-icon bi ${icon}`} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
