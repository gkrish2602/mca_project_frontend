import { useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import { EmptyState, ErrorToast } from '../components/common/Feedback'
import ActionItemRow from '../components/actions/ActionItemRow'
import { useGetActionItemsQuery, useUpdateActionItemMutation } from '../services/api'

const filters = ['all', 'pending', 'done', 'overdue']

export default function TasksPage() {
  const [filter, setFilter] = useState('all')
  const tasksQuery = useGetActionItemsQuery()
  const [updateAction, updateState] = useUpdateActionItemMutation()
  const items = tasksQuery.data?.results || tasksQuery.data || []
  const visibleItems = useMemo(
    () => filter === 'all' ? items : items.filter((item) => item.status === filter),
    [filter, items],
  )

  function changeStatus(item, status) {
    updateAction({ id: item.id, status })
  }

  return (
    <>
      <PageHeader eyebrow="FOLLOW THROUGH" title="Action items" description="Small promises, clearly tracked. Keep the important work moving." />
      <ErrorToast error={tasksQuery.error || updateState.error} onRetry={tasksQuery.refetch} />
      <div className="filter-row" role="tablist" aria-label="Filter action items">
        {filters.map((value) => (
          <button key={value} className={`filter-chip${filter === value ? ' selected' : ''}`} onClick={() => setFilter(value)} role="tab" aria-selected={filter === value}>
            {value === 'all' ? 'Everything' : value === 'done' ? 'Completed' : value === 'overdue' ? 'Overdue' : 'In progress'}
          </button>
        ))}
        <span className="filter-count">{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}</span>
      </div>
      {tasksQuery.isLoading ? <LoadingState label="Loading action items..." /> : visibleItems.length
        ? <div className="panel action-list task-list">{visibleItems.map((item) => <ActionItemRow key={item.id} item={item} onStatusChange={changeStatus} isUpdating={updateState.isLoading} />)}</div>
        : <EmptyState icon="bi-check2-square" title="Nothing on this list right now" description={filter === 'all' ? 'Action items from your meetings will appear here.' : `No ${filter} action items at the moment.`} />}
    </>
  )
}
