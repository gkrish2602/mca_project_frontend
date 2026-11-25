import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { dismissToast } from '../../features/notifications/toastSlice'

const toastIcons = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
}

function BootstrapToast({ toast }) {
  const dispatch = useAppDispatch()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (visible) setVisible(false)
      else dispatch(dismissToast(toast.id))
    }, visible ? 5000 : 200)

    return () => window.clearTimeout(timeout)
  }, [dispatch, toast.id, visible])

  function dismiss() {
    setVisible(false)
  }

  const icon = toastIcons[toast.variant] || toastIcons.info

  return (
    <div
      className={`toast fade app-toast${visible ? ' show' : ''}`}
      role={toast.variant === 'danger' ? 'alert' : 'status'}
      aria-live={toast.variant === 'danger' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="toast-header">
        <i className={`bi ${icon} toast-icon toast-icon-${toast.variant}`} aria-hidden="true" />
        <strong className="me-auto">{toast.variant === 'danger' ? 'Something needs attention' : 'Meetwise'}</strong>
        <button type="button" className="btn-close" aria-label="Dismiss" onClick={dismiss} />
      </div>
      <div className="toast-body">{toast.message}</div>
    </div>
  )
}

export default function ToastViewport() {
  const toasts = useAppSelector((state) => state.toasts.items)

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3 app-toast-viewport" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => <BootstrapToast key={toast.id} toast={toast} />)}
    </div>
  )
}
