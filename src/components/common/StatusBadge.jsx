const statusLabels = {
  pending: 'Pending',
  done: 'Completed',
  overdue: 'Overdue',
}

export default function StatusBadge({ status }) {
  const value = statusLabels[status] ? status : 'pending'
  return <span className={`status-badge status-${value}`}>{statusLabels[value]}</span>
}
