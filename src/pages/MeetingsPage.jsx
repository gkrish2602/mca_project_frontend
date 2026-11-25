import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import { EmptyState, ErrorToast } from '../components/common/Feedback'
import MeetingCard from '../components/meetings/MeetingCard'
import MeetingForm from '../components/meetings/MeetingForm'
import { useCreateMeetingMutation, useGetMeetingsQuery } from '../services/api'

export default function MeetingsPage() {
  const meetingsQuery = useGetMeetingsQuery(undefined, { pollingInterval: 15000, skipPollingIfUnfocused: true })
  const [createMeeting, createState] = useCreateMeetingMutation()
  const meetings = meetingsQuery.data?.results || meetingsQuery.data || []

  async function handleCreate(formData) {
    await createMeeting(formData).unwrap()
  }

  return (
    <>
      <PageHeader
        eyebrow="YOUR CONVERSATIONS"
        title="Meetings"
        description="One place for the conversations, decisions, and follow-through."
        action={<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#create-meeting-modal"><i className="bi bi-plus-lg me-2" />Add meeting</button>}
      />
      <ErrorToast error={meetingsQuery.error} onRetry={meetingsQuery.refetch} />
      {meetingsQuery.isLoading ? <LoadingState label="Loading meetings..." /> : meetings.length
        ? <div className="meeting-grid">{meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)}</div>
        : <EmptyState icon="bi-camera-video" title="A good conversation deserves a clear next step." description="Upload your first meeting recording and find the important moments without replaying the whole conversation." action={<button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#create-meeting-modal">Add your first meeting</button>} />}
      <MeetingForm onCreate={handleCreate} isLoading={createState.isLoading} error={createState.error} />
    </>
  )
}
