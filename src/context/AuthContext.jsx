import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const MOCK_USER = {
  _id:   'mock_user_anubhab',
  name:  'Anubhab',
  email: 'anubhab@learnpro.dev',
  role:  'student',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER)

  const login    = async () => setUser(MOCK_USER)
  const register = async () => setUser(MOCK_USER)
  const logout   = ()       => setUser(MOCK_USER)

  return (
    <AuthContext.Provider value={{ user, loading: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}