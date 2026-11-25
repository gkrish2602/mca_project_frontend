import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import { EmptyState, ErrorToast } from '../components/common/Feedback'
import StatusBadge from '../components/common/StatusBadge'
import { useGetMeetingQuery, useRetryMeetingMutation } from '../services/api'

function TextPanel({ title, icon, text, empty }) {
  return (
    <section className="panel detail-panel">
      <div className="detail-panel-heading"><span className="panel-icon"><i className={`bi ${icon}`} /></span><h2>{title}</h2></div>
      {text ? <p className="detail-text">{text}</p> : <p className="detail-placeholder">{empty}</p>}
    </section>
  )
}

export default function MeetingDetailPage() {
  const { id } = useParams()
  const { data: meeting, isLoading, isError, error, refetch } = useGetMeetingQuery(id, {
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  })
  const [retryMeeting, retryState] = useRetryMeetingMutation()

  if (isLoading) return <LoadingState label="Opening meeting notes..." />
  if (isError) return <><Link className="back-link" to="/meetings"><i className="bi bi-arrow-left" /> All meetings</Link><ErrorToast error={error} onRetry={refetch} /></>
  if (!meeting) return <EmptyState title="Meeting not found" description="This meeting may have been removed or you may not have access." action={<Link className="btn btn-primary" to="/meetings">Back to meetings</Link>} />

  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(meeting.created_at))

  return (
    <>
      <Link className="back-link" to="/meetings"><i className="bi bi-arrow-left" /> All meetings</Link>
      <PageHeader
        eyebrow={`MEETING NOTES · ${date} · ${meeting.status || 'completed'}`}
        title={meeting.title}
        description="The important moments and what happens next."
        action={meeting.status === 'failed' && <button className="btn btn-primary" onClick={() => retryMeeting(id)} disabled={retryState.isLoading}>
          {retryState.isLoading ? 'Retrying…' : 'Retry processing'}
        </button>}
      />
      <ErrorToast error={error} onRetry={refetch} />
      <ErrorToast error={retryState.error} />
      {meeting.processing_error && <div className="alert alert-danger" role="alert">{meeting.processing_error} Check the backend worker and AI API configuration, then retry.</div>}
      <div className="detail-layout">
        <div className="detail-main">
          <TextPanel title="Summary" icon="bi-stars" text={meeting.summary} empty="Summary is being prepared. Check back in a moment." />
          <TextPanel title="Key decisions" icon="bi-signpost-split" text={meeting.decisions} empty="Decisions will appear here after the recording has been processed." />
          <section className="panel detail-panel">
            <div className="detail-panel-heading"><span className="panel-icon"><i className="bi bi-chat-square-text" /></span><h2>Transcript</h2></div>
            {meeting.transcript ? <p className="detail-text transcript-text">{meeting.transcript}</p> : <p className="detail-placeholder">The transcript is being prepared.</p>}
          </section>
        </div>
        <aside className="detail-aside">
          <section className="panel detail-panel">
            <div className="detail-panel-heading"><span className="panel-icon"><i className="bi bi-check2-square" /></span><h2>Action items</h2></div>
            {meeting.action_items?.length ? meeting.action_items.map((item) => (
              <div className="detail-task" key={item.id}>
                <strong>{item.description}</strong>
                <div><StatusBadge status={item.status} /><span className="detail-task-date">{item.deadline ? new Date(`${item.deadline}T00:00:00`).toLocaleDateString() : 'No deadline'}</span></div>
                <span className="detail-task-date">Assigned to {item.assigned_to_name || 'Meeting owner'}</span>
              </div>
            )) : <p className="detail-placeholder">Action items from this conversation will appear here.</p>}
          </section>
          <section className="panel detail-panel">
            <div className="detail-panel-heading"><span className="panel-icon"><i className="bi bi-question-circle" /></span><h2>Open questions</h2></div>
            {meeting.unresolved_questions?.length
              ? <ul className="question-list">{meeting.unresolved_questions.map((item) => <li key={item.id}>{item.question}</li>)}</ul>
              : <p className="detail-placeholder">No open questions captured.</p>}
          </section>
        </aside>
      </div>
    </>
  )
}
