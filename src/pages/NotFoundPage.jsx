import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <span className="eyebrow">404 · NOT HERE</span>
      <h1>Looks like this page wandered off.</h1>
      <Link className="btn btn-primary" to="/">Back to your workspace</Link>
    </div>
  )
}
