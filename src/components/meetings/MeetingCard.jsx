import { memo } from 'react'
import { Link } from 'react-router-dom'

function MeetingCard({ meeting }) {
  const date = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(meeting.created_at))
  const processing = meeting.status === 'queued' || meeting.status === 'processing'
  const failed = meeting.status === 'failed'
  const ready = meeting.status === 'completed' || (!meeting.status && Boolean(meeting.summary))
  const label = failed ? 'Processing failed' : ready ? 'Summary ready' : processing ? 'Processing' : 'Queued'

  return (
    <Link className="meeting-card" to={`/meetings/${meeting.id}`}>
      <div className="meeting-card-top">
        <span className="meeting-icon"><i className="bi bi-mic" /></span>
        <span className={`processing-pill${ready ? ' ready' : ''}${failed ? ' failed' : ''}`}><span />{label}</span>
      </div>
      <h3>{meeting.title}</h3>
      <p className="meeting-preview">{meeting.summary || meeting.processing_error || 'Your meeting notes and action items will appear here once processing is complete.'}</p>
      <div className="meeting-card-footer">
        <span><i className="bi bi-calendar3" /> {date}</span>
        <span>{meeting.action_items?.length || 0} action items <i className="bi bi-arrow-up-right" /></span>
      </div>
    </Link>
  )
}

export default memo(MeetingCard)
