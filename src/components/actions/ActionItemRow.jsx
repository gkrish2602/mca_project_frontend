import { memo, useState } from 'react'
import StatusBadge from '../common/StatusBadge'
import { useDraftFollowupMutation, useSendEmailDraftMutation, useUpdateEmailDraftMutation } from '../../services/api'

function ActionItemRow({ item, onStatusChange, isUpdating }) {
  const deadline = item.deadline
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${item.deadline}T00:00:00`))
    : 'No deadline'
  const [draft, setDraft] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [createDraft, draftState] = useDraftFollowupMutation()
  const [updateDraft, updateState] = useUpdateEmailDraftMutation()
  const [sendDraft, sendState] = useSendEmailDraftMutation()

  async function openDraft() {
    setFeedback('')
    try {
      setDraft(await createDraft(item.id).unwrap())
    } catch (error) {
      setFeedback(error.data?.detail || 'Could not create the follow-up draft.')
    }
  }

  async function sendFollowup() {
    try {
      await updateDraft({ id: draft.id, subject: draft.subject, body: draft.body }).unwrap()
      await sendDraft(draft.id).unwrap()
      setDraft(null)
      setFeedback('Follow-up email sent.')
    } catch (error) {
      setFeedback(error.data?.detail || 'Could not send the follow-up email.')
    }
  }

  return (
    <div className="action-row">
      <div className="action-check">
        <button
          className={`check-button${item.status === 'done' ? ' checked' : ''}`}
          aria-label={item.status === 'done' ? 'Mark as pending' : 'Mark as completed'}
          disabled={isUpdating}
          onClick={() => onStatusChange(item, item.status === 'done' ? 'pending' : 'done')}
        >
          {item.status === 'done' && <i className="bi bi-check2" />}
        </button>
      </div>
      <div className="action-copy">
        <strong className={item.status === 'done' ? 'text-done' : ''}>{item.description}</strong>
        <span><i className="bi bi-calendar3" /> {deadline === 'No deadline' ? deadline : `Due ${deadline}`} <span className="action-divider">·</span> {item.priority || 'medium'} priority{item.assigned_to_name && <> <span className="action-divider">·</span> {item.assigned_to_name}</>}</span>
        {!draft && <button className="btn btn-sm btn-link px-0 py-0" type="button" onClick={openDraft} disabled={draftState.isLoading || !item.assigned_to_name}>
          {draftState.isLoading ? 'Preparing draft…' : 'Draft follow-up'}
        </button>}
        {feedback && <span className={feedback.includes('sent') ? 'text-success' : 'text-danger'} role="status">{feedback}</span>}
        {draft && <div className="follow-up-editor">
          <label className="form-label" htmlFor={`follow-up-subject-${item.id}`}>Subject</label>
          <input className="form-control form-control-sm mb-2" id={`follow-up-subject-${item.id}`} value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} maxLength={255} />
          <label className="form-label" htmlFor={`follow-up-body-${item.id}`}>Message</label>
          <textarea className="form-control form-control-sm mb-2" id={`follow-up-body-${item.id}`} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} rows={5} maxLength={20000} />
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-primary" type="button" onClick={sendFollowup} disabled={updateState.isLoading || sendState.isLoading || !draft.subject.trim() || !draft.body.trim()}>
              {sendState.isLoading ? 'Sending…' : 'Send email'}
            </button>
            <button className="btn btn-sm btn-light" type="button" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </div>}
      </div>
      <StatusBadge status={item.status} />
    </div>
  )
}

export default memo(ActionItemRow)
