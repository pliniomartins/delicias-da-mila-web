import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const fullName = localStorage.getItem('fullName')
    const email = localStorage.getItem('email')
    return token ? { token, fullName, email } : null
  })

  function login(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('fullName', data.fullName)
    localStorage.setItem('email', data.email)
    setUser(data)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('fullName')
    localStorage.removeItem('email')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}