import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import { clearSession } from '../../features/auth/authSlice'
import { useGetMeQuery } from '../../services/api'

const links = [
  { to: '/', label: 'Overview', icon: 'bi-grid-1x2' },
  { to: '/meetings', label: 'Meetings', icon: 'bi-camera-video' },
  { to: '/tasks', label: 'Action items', icon: 'bi-check2-square' },
]

export default function AppLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { data: user } = useGetMeQuery()
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const initials = `${user?.first_name?.[0] || user?.username?.[0] || 'U'}${user?.last_name?.[0] || ''}`.toUpperCase()

  useEffect(() => {
    if (!showLogoutConfirmation) return undefined

    function closeOnEscape(event) {
      if (event.key === 'Escape') setShowLogoutConfirmation(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [showLogoutConfirmation])

  function signOut() {
    setShowLogoutConfirmation(false)
    dispatch(clearSession())
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark"><i className="bi bi-soundwave" /></span>
          <span>meetwise<span className="brand-period">.</span><small>TEAM WORKSPACE</small></span>
        </NavLink>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className={`bi ${link.icon}`} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <i className="bi bi-stars" />
            <strong>Good meetings, made actionable.</strong>
            <span>Your notes and next steps stay in sync.</span>
          </div>
          <button className="profile-button" onClick={() => setShowLogoutConfirmation(true)} title="Sign out">
            <span className="avatar">{initials}</span>
            <span className="profile-copy"><strong>{user?.first_name || user?.username || 'Your account'}</strong><small>Sign out</small></span>
            <i className="bi bi-box-arrow-right profile-exit" />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-context"><span className="topbar-dot" /> YOUR TEAM SPACE</div>
          <div className="topbar-right">
            <span className="topbar-date">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span>
            <div className="dropdown">
              <button
                className="topbar-profile dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Open profile menu"
              >
                <span className="topbar-avatar">{initials}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end profile-dropdown">
                <li className="profile-dropdown-heading">
                  <strong>{user?.first_name || user?.username || 'Your account'}</strong>
                  {user?.username && <span>@{user.username}</span>}
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item profile-logout" type="button" onClick={() => setShowLogoutConfirmation(true)}>
                    <i className="bi bi-box-arrow-right" /> Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
      {showLogoutConfirmation && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowLogoutConfirmation(false)} />
          <div
            className="modal fade show d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirmation-title"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-0">
                  <div>
                    <div className="eyebrow">END YOUR SESSION</div>
                    <h2 className="modal-title" id="logout-confirmation-title">Sign out?</h2>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setShowLogoutConfirmation(false)} aria-label="Close" />
                </div>
                <div className="modal-body">
                  <p className="dialog-copy">Are you sure you want to sign out of your account?</p>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-light" onClick={() => setShowLogoutConfirmation(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={signOut}>Sign out</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
