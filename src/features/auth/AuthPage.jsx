import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { useLoginMutation, useRegisterMutation } from '../../services/api'
import { ErrorToast } from '../../components/common/Feedback'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const session = useAppSelector((state) => state.auth.session)
  const navigate = useNavigate()
  const [login, { isLoading: loggingIn, error: loginError }] = useLoginMutation()
  const [register, { isLoading: registering, error: registerError }] = useRegisterMutation()

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const username = form.get('username').trim()
    const password = form.get('password')

    try {
      if (isRegister) {
        await register({
          username,
          email: form.get('email').trim(),
          password,
          organization: form.get('organization').trim(),
        }).unwrap()
      }
      await login({ username, password }).unwrap()
      navigate('/', { replace: true })
    } catch {
      // Authentication errors are shown through the shared toast component.
    }
  }

  const busy = loggingIn || registering

  return (
    <main className="auth-screen">
      <div className="auth-brand">
        <span className="brand-mark"><i className="bi bi-soundwave" /></span>
        <span>meetwise<span className="brand-period">.</span></span>
      </div>
      <section className="auth-card">
        <div className="auth-heading">
          <span className="auth-icon"><i className={`bi ${isRegister ? 'bi-person-plus' : 'bi-stars'}`} /></span>
          <div className="eyebrow">{isRegister ? 'YOUR TEAM STARTS HERE' : 'WELCOME BACK'}</div>
          <h1>{isRegister ? 'Create your account' : 'Let’s get back to it.'}</h1>
          <p>{isRegister ? 'A clearer view of every conversation and commitment.' : 'Sign in to see what your team is moving forward.'}</p>
        </div>
        <ErrorToast error={loginError || registerError} />
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label className="form-label" htmlFor="email">Work email</label>
              <input className="form-control" id="email" name="email" type="email" autoComplete="email" required />
              <label className="form-label" htmlFor="organization">Organization <span className="optional">(optional)</span></label>
              <input className="form-control" id="organization" name="organization" autoComplete="organization" />
            </>
          )}
          <label className="form-label" htmlFor="username">Username</label>
          <input className="form-control" id="username" name="username" autoComplete="username" required />
          <label className="form-label" htmlFor="password">Password</label>
          <input className="form-control" id="password" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} required />
          <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
            {busy ? <><span className="spinner-border spinner-border-sm me-2" />Please wait...</> : <>{isRegister ? 'Create account' : 'Sign in'} <i className="bi bi-arrow-right ms-2" /></>}
          </button>
        </form>
        <div className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to Meetwise?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </div>
      </section>
      <p className="auth-footnote">A thoughtful place for the work that happens after a meeting.</p>
    </main>
  )
}
