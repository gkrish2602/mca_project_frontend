import { useRef, useState } from 'react'
import { Modal } from 'bootstrap'
import { ErrorToast } from '../common/Feedback'

export default function MeetingForm({ onCreate, isLoading, error }) {
  const modalElement = useRef(null)
  const [inputType, setInputType] = useState('audio')
  const [inputError, setInputError] = useState('')

  async function submit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setInputError('')
    if (inputType === 'audio') {
      form.delete('transcript')
      if (!form.get('audio_file')?.size) {
        setInputError('Choose an audio recording to continue.')
        return
      }
      if (form.get('audio_file').size > 25 * 1024 * 1024) {
        setInputError('Audio files must be 25 MB or smaller.')
        return
      }
    } else {
      form.delete('audio_file')
      if (!form.get('transcript')?.trim()) {
        setInputError('Paste a transcript or meeting notes to continue.')
        return
      }
    }
    try {
      await onCreate(form)
      Modal.getOrCreateInstance(modalElement.current).hide()
      formElement.reset()
      setInputType('audio')
    } catch {
      // The mutation error is surfaced as a toast.
    }
  }

  return (
    <div ref={modalElement} id="create-meeting-modal" className="modal fade" tabIndex="-1" aria-labelledby="meeting-dialog-title" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <div><div className="eyebrow">NEW RECORDING</div><h2 className="modal-title" id="meeting-dialog-title">Add a meeting</h2></div>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div className="modal-body">
            <p className="dialog-copy">Add a recording or paste notes and we’ll prepare a summary and next steps.</p>
            <ErrorToast error={error} />
            <form onSubmit={submit}>
              <label className="form-label" htmlFor="meeting-title">Meeting name</label>
              <input className="form-control mb-3" id="meeting-title" name="title" placeholder="e.g. Weekly product check-in" required maxLength={255} />
              <div className="filter-row mb-3" role="group" aria-label="Meeting input type">
                <button type="button" className={`filter-chip${inputType === 'audio' ? ' selected' : ''}`} onClick={() => { setInputType('audio'); setInputError('') }}>Audio recording</button>
                <button type="button" className={`filter-chip${inputType === 'transcript' ? ' selected' : ''}`} onClick={() => { setInputType('transcript'); setInputError('') }}>Transcript or notes</button>
              </div>
              {inputType === 'audio' ? (
                <>
                  <label className="form-label" htmlFor="audio-file">Audio recording</label>
                  <input className="form-control" id="audio-file" name="audio_file" type="file" accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm" />
                  <div className="form-text mb-4">MP3, MP4, MPEG, MPGA, M4A, WAV, or WebM · up to 25 MB.</div>
                </>
              ) : (
                <>
                  <label className="form-label" htmlFor="meeting-transcript">Transcript or rough notes</label>
                  <textarea className="form-control mb-2" id="meeting-transcript" name="transcript" rows={7} maxLength={100000} placeholder="Paste your transcript or meeting notes..." />
                  <div className="form-text mb-4">Up to 100,000 characters. The AI will organize the notes into a summary and action items.</div>
                </>
              )}
              {inputError && <p className="text-danger small" role="alert">{inputError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</> : 'Save meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
