import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logo from '../assets/deliciasdamila.jpeg'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hora, setHora] = useState('')
  const [pedidosHoje, setPedidosHoje] = useState(0)

  useEffect(() => {
    const atualizar = () => {
      const now = new Date()
      setHora(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }
    atualizar()
    const interval = setInterval(atualizar, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('http://localhost:5028/api/Pedidos')
      .then(r => r.json())
      .then(data => {
        const hoje = new Date().toDateString()
        const count = data.filter(p => new Date(p.criadoEm).toDateString() === hoje).length
        setPedidosHoje(count)
      })
      .catch(() => {})
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: "'Georgia', serif",
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background decorativo rosa/pink temático */}
      <div style={{
        position: 'fixed',
        top: '-200px',
        right: '-200px',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(15,15,15,0.92)'
      }}>
        {/* Logo com imagem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={logo}
            alt="Delícias da Mila"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              objectFit: 'cover',
              objectPosition: 'top',
              border: '2px solid rgba(236,72,153,0.5)',
              boxShadow: '0 4px 20px rgba(236,72,153,0.3)'
            }}
          />
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              background: 'linear-gradient(135deg, #fff, #f9a8d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Delícias da Mila
            </div>
            <div style={{ fontSize: '11px', color: '#ec4899', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Painel Administrativo
            </div>
          </div>
        </div>

        {/* Info do usuário */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Bem-vinda,</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{user?.fullName} 👋</div>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ec4899', fontFamily: 'monospace' }}>{hora}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(236,72,153,0.5)',
              color: '#ec4899',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => { e.target.style.background = '#ec4899'; e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#ec4899' }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: '48px 40px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Hero com logo grande */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
          marginBottom: '48px',
          flexWrap: 'wrap'
        }}>
          <img
            src={logo}
            alt="Delícias da Mila"
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '28px',
              objectFit: 'cover',
              objectPosition: 'top',
              border: '3px solid rgba(236,72,153,0.4)',
              boxShadow: '0 8px 40px rgba(236,72,153,0.25)'
            }}
          />
          <div>
            <h2 style={{
              fontSize: '38px',
              fontWeight: 'bold',
              margin: 0,
              background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.4))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              Bom dia, Mila! ☀️
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '10px', fontSize: '15px' }}>
              Gerencie seu negócio com estilo e sabor. 🍫
            </p>

            {/* Card pedidos inline */}
            <div style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
              border: '1px solid rgba(236,72,153,0.3)',
              borderRadius: '14px',
              padding: '14px 24px',
            }}>
              <span style={{ fontSize: '28px' }}>📦</span>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#ec4899', lineHeight: 1 }}>{pedidosHoje}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Pedidos hoje</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de navegação */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <NavCard
            emoji="🍔"
            title="Produtos"
            desc="Gerencie o cardápio completo"
            color="#ec4899"
            onClick={() => navigate('/produtos')}
            badge="Ativo"
          />
          <NavCard
            emoji="📋"
            title="Cardápio"
            desc="Veja como os clientes enxergam"
            color="#f97316"
            onClick={() => navigate('/cardapio')}
            badge="Público"
          />
          <NavCard
            emoji="🛒"
            title="Pedidos"
            desc="Acompanhe em tempo real"
            color="#22c55e"
            onClick={() => navigate('/pedidos')}
            badge="Ao vivo"
            pulse
          />
        </div>

        {/* Rodapé */}
        <div style={{
          marginTop: '60px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '1px'
        }}>
          DELÍCIAS DA MILA © {new Date().getFullYear()} — FEITO COM ❤️
        </div>
      </main>
    </div>
  )
}

function NavCard({ emoji, title, desc, color, onClick, badge, pulse }) {
  const [hovered, setHovered] = useState(false)

  const colorMap = {
    '#ec4899': '236,72,153',
    '#f97316': '249,115,22',
    '#22c55e': '34,197,94',
  }
  const rgb = colorMap[color] || '255,255,255'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, rgba(${rgb},0.2), rgba(${rgb},0.05))`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px',
        padding: '32px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(${rgb},0.2)` : 'none',
        position: 'relative',
      }}
    >
      {/* Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: `rgba(${rgb},0.15)`,
        border: `1px solid rgba(${rgb},0.4)`,
        color: color,
        fontSize: '10px',
        padding: '3px 10px',
        borderRadius: '20px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {pulse && (
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            animation: 'pulse 1.5s infinite'
          }} />
        )}
        {badge}
      </div>

      <div style={{
        fontSize: '44px',
        marginBottom: '16px',
        display: 'inline-block',
        transition: 'transform 0.3s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {emoji}
      </div>

      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{desc}</div>

      <div style={{
        marginTop: '24px',
        fontSize: '12px',
        color: hovered ? color : 'rgba(255,255,255,0.2)',
        transition: 'color 0.3s',
        letterSpacing: '1px'
      }}>
        ACESSAR →
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
