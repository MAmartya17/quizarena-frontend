import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DiyaIcon, SparkleIcon } from '../components/Icons'

export default function Login() {
  const { loginWithGoogle } = useAuth()
  const nav = useNavigate()

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <div className="card mt-lg" style={{ textAlign: 'center', padding: '40px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <DiyaIcon size={80} />
        </div>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Welcome to QuizArena</h2>
        <p className="muted" style={{ marginBottom: 28 }}>
          <SparkleIcon size={14} color="#FFB627" /> Sign in with Google to start your journey
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            theme="filled_black" size="large" shape="pill"
            onSuccess={async (cred) => {
              await loginWithGoogle(cred.credential)
              nav('/')
            }}
            onError={() => alert('Google sign-in failed')}
          />
        </div>
        <p className="muted mt-lg" style={{ fontSize: 12 }}>
          By signing in, you agree to play fair and have fun.
        </p>
      </div>
    </div>
  )
}