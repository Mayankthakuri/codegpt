import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      window.location.href = '/'
    } else if (!user) {
      navigate('/auth')
    }
  }, [searchParams, navigate, user])

  return (
    <div className="auth-callback">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Signing you in...</p>
      </div>
    </div>
  )
}
