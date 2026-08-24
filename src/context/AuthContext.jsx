import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axiosClient'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })
  const [loading, setLoading] = useState(false)

  const loginWithGoogle = async (idToken) => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/google', { idToken })
      localStorage.setItem('token', data.token)
      const u = { id: data.userId, email: data.email, name: data.name, pictureUrl: data.pictureUrl }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      return u
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}