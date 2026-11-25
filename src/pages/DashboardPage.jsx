import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import { EmptyState, ErrorToast } from '../components/common/Feedback'
import MeetingCard from '../components/meetings/MeetingCard'
import ActionItemRow from '../components/actions/ActionItemRow'
import { useGetActionItemsQuery, useGetAnalyticsQuery, useGetMeetingsQuery, useUpdateActionItemMutation } from '../services/api'

function MetricCard({ icon, label, value, detail, tone }) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${tone}`}><i className={`bi ${icon}`} /></span>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-detail">{detail}</span>
    </article>
  )
}

export default function DashboardPage() {
  const meetingsQuery = useGetMeetingsQuery(undefined, { pollingInterval: 15000, skipPollingIfUnfocused: true })
  const analyticsQuery = useGetAnalyticsQuery(undefined, { pollingInterval: 15000, skipPollingIfUnfocused: true })
  const tasksQuery = useGetActionItemsQuery(undefined, { pollingInterval: 15000, skipPollingIfUnfocused: true })
  const [updateAction, updateState] = useUpdateActionItemMutation()
  const meetings = meetingsQuery.data?.results || meetingsQuery.data || []
  const tasks = (tasksQuery.data?.results || tasksQuery.data || []).slice(0, 4)
  const analytics = analyticsQuery.data || {}
  const firstError = meetingsQuery.error || analyticsQuery.error || tasksQuery.error
  const isLoading = meetingsQuery.isLoading || analyticsQuery.isLoading || tasksQuery.isLoading
  const completedRatio = analytics.total_action_items
    ? `${Math.round((analytics.completed_action_items / analytics.total_action_items) * 100)}%`
    : '—'

  function changeStatus(item, status) {
    updateAction({ id: item.id, status })
  }

  if (isLoading) return <LoadingState />

  return (
    <>
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="A clearer view of the work."
        description="The conversations, decisions, and next steps your team is moving forward."
        action={<Link className="btn btn-primary" to="/meetings"><i className="bi bi-plus-lg me-2" />New meeting</Link>}
      />
      <ErrorToast error={firstError || updateState.error} onRetry={() => { meetingsQuery.refetch(); analyticsQuery.refetch(); tasksQuery.refetch() }} />
      <section className="metrics-grid" aria-label="Workspace metrics">
        <MetricCard icon="bi-camera-video" label="Meetings captured" value={analytics.total_meetings ?? 0} detail="All your team conversations" tone="metric-lavender" />
        <MetricCard icon="bi-check2-circle" label="Action items" value={analytics.total_action_items ?? 0} detail={`${completedRatio} completed`} tone="metric-mint" />
        <MetricCard icon="bi-hourglass-split" label="Still in progress" value={Math.max((analytics.total_action_items || 0) - (analytics.completed_action_items || 0), 0)} detail="Across your workspace" tone="metric-peach" />
        <MetricCard icon="bi-graph-up-arrow" label="Productivity score" value={analytics.avg_productivity_score == null ? '—' : `${Math.round(analytics.avg_productivity_score * 10)}%`} detail="Average meeting score" tone="metric-sky" />
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div><div className="eyebrow">RECENT CONVERSATIONS</div><h2>Meetings, at a glance</h2></div>
          <Link className="text-link" to="/meetings">All meetings <i className="bi bi-arrow-right" /></Link>
        </div>
        {meetings.length ? (
          <div className="meeting-grid">{meetings.slice(0, 3).map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)}</div>
        ) : (
          <EmptyState icon="bi-mic" title="Your first meeting starts here" description="Add a recording and we’ll turn it into clear notes and next steps." action={<Link className="btn btn-primary" to="/meetings">Add a meeting</Link>} />
        )}
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div><div className="eyebrow">THE NEXT STEPS</div><h2>Action items to keep moving</h2></div>
          <Link className="text-link" to="/tasks">See all action items <i className="bi bi-arrow-right" /></Link>
        </div>
        {tasks.length ? <div className="panel action-list">{tasks.map((item) => <ActionItemRow key={item.id} item={item} onStatusChange={changeStatus} isUpdating={updateState.isLoading} />)}</div> : <EmptyState icon="bi-check2-square" title="No action items yet" description="Action items from processed meetings will show up here." />}
      </section>
    </>
  )
}
