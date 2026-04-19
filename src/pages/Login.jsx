import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import logo from '../assets/deliciasdamila.jpeg'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/login', { email, password })
      login(response.data)
      navigate('/dashboard')
    } catch {
      setError('Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Backgrounds decorativos */}
      <div style={{
        position: 'fixed', top: '-200px', right: '-200px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: '-150px', left: '-150px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Card de login */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '20px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(236,72,153,0.2)',
        borderRadius: '24px',
        padding: '48px 40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
      }}>

        {/* Logo e título */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img
            src={logo}
            alt="Delícias da Mila"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '24px',
              objectFit: 'cover',
              objectPosition: 'top',
              border: '3px solid rgba(236,72,153,0.5)',
              boxShadow: '0 8px 30px rgba(236,72,153,0.3)',
              marginBottom: '20px'
            }}
          />
          <h1 style={{
            fontSize: '26px',
            fontWeight: 'bold',
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #fff, #f9a8d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Delícias da Mila
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: 0
          }}>
            Painel Administrativo
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '13px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Georgia, serif',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '13px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Georgia, serif',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '14px',
              background: loading
                ? 'rgba(236,72,153,0.3)'
                : 'linear-gradient(135deg, #ec4899, #be185d)',
              border: 'none',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Georgia, serif',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(236,72,153,0.4)',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
          >
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>

        {/* Rodapé */}
        <div style={{
          marginTop: '32px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '1px'
        }}>
          DELÍCIAS DA MILA © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
