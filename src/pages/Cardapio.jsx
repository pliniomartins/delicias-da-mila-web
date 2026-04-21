import { useEffect, useState } from 'react'
import api from '../services/api'
import logo from '../assets/deliciasdamila.jpeg'

export default function Cardapio() {
  const [categorias, setCategorias] = useState([])
  const [produtos, setProdutos] = useState([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [carrinho, setCarrinho] = useState([])
  const [showCarrinho, setShowCarrinho] = useState(false)
  const [showFormPedido, setShowFormPedido] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [tipoEntrega, setTipoEntrega] = useState('Entrega')
  const [form, setForm] = useState({ clienteNome: '', clienteTelefone: '', endereco: '' })

  useEffect(() => {
    async function carregar() {
      const [cats, prods] = await Promise.all([
        api.get('/categorias'),
        api.get('/produtos')
      ])
      setCategorias(cats.data)
      setProdutos(prods.data)
      setLoading(false)
    }
    carregar()
  }, [])

  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(p => p.categoriaNome === categoriaSelecionada)
    : produtos

  const totalItens = carrinho.reduce((acc, i) => acc + i.quantidade, 0)
  const totalPreco = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0)
  const taxaEntrega = tipoEntrega === 'Entrega' ? 5 : 0
  const totalFinal = totalPreco + taxaEntrega

  function adicionarAoCarrinho(produto) {
    setCarrinho(prev => {
      const existe = prev.find(i => i.id === produto.id)
      if (existe) return prev.map(i => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { ...produto, quantidade: 1 }]
    })
  }

  function removerDoCarrinho(id) {
    setCarrinho(prev => {
      const item = prev.find(i => i.id === id)
      if (item.quantidade === 1) return prev.filter(i => i.id !== id)
      return prev.map(i => i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i)
    })
  }

  function removerTudo(id) {
    setCarrinho(prev => prev.filter(i => i.id !== id))
  }

  async function handleFinalizarPedido() {
    if (!form.clienteNome || !form.clienteTelefone) {
      alert('Preencha nome e telefone!')
      return
    }
    if (tipoEntrega === 'Entrega' && !form.endereco) {
      alert('Preencha o endereço de entrega!')
      return
    }
    setEnviando(true)
    try {
      const response = await api.post('/pedidos', {
        clienteNome: form.clienteNome,
        clienteTelefone: form.clienteTelefone,
        endereco: tipoEntrega === 'Retirada' ? 'Retirada no balcão' : form.endereco,
        tipoEntrega,
        itens: carrinho.map(i => ({ produtoId: i.id, quantidade: i.quantidade }))
      })

      // 🔥 Abre o WhatsApp automaticamente
      if (response.data.whatsapp) {
        window.open(response.data.whatsapp, '_blank')
      }

      setCarrinho([])
      setShowCarrinho(false)
      setShowFormPedido(false)
      setForm({ clienteNome: '', clienteTelefone: '', endereco: '' })
      setTipoEntrega('Entrega')
      setPedidoEnviado(true)
      setTimeout(() => setPedidoEnviado(false), 5000)
    } catch {
      alert('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <img src={logo} alt="Delícias da Mila" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', objectPosition: 'top', border: '2px solid rgba(236,72,153,0.5)', animation: 'pulseLogo 1.5s infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif', letterSpacing: '2px', fontSize: '13px' }}>CARREGANDO CARDÁPIO...</p>
      <style>{`@keyframes pulseLogo { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'Georgia', serif", color: '#fff', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {pedidoEnviado && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', padding: '16px 32px', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', zIndex: 999, boxShadow: '0 8px 30px rgba(34,197,94,0.4)', animation: 'slideDown 0.3s ease' }}>
          ✅ Pedido enviado! A Mila já recebeu! 🎉
        </div>
      )}

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,15,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logo} alt="Delícias da Mila" style={{ width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover', objectPosition: 'top', border: '2px solid rgba(236,72,153,0.5)', boxShadow: '0 4px 20px rgba(236,72,153,0.3)' }} />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', background: 'linear-gradient(135deg, #fff, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>Delícias da Mila</div>
            <div style={{ fontSize: '11px', color: '#ec4899', letterSpacing: '3px', textTransform: 'uppercase' }}>Cardápio</div>
          </div>
        </div>

        <button onClick={() => setShowCarrinho(true)} style={{ background: totalItens > 0 ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(236,72,153,0.4)', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', transition: 'all 0.2s', boxShadow: totalItens > 0 ? '0 4px 15px rgba(236,72,153,0.4)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛒
          {totalItens > 0 && <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{totalItens} • R$ {totalFinal.toFixed(2)}</span>}
          {totalItens === 0 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Carrinho</span>}
        </button>
      </header>

      <div style={{ display: 'flex', gap: '10px', padding: '20px 32px', overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none' }}>
        <CatBtn label="Todos" active={!categoriaSelecionada} onClick={() => setCategoriaSelecionada(null)} />
        {categorias.map(cat => (
          <CatBtn key={cat.id} label={cat.nome} active={categoriaSelecionada === cat.nome} onClick={() => setCategoriaSelecionada(cat.nome)} />
        ))}
      </div>

      <div style={{ padding: '24px 32px 8px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', letterSpacing: '1px' }}>
        {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'ITEM' : 'ITENS'}
        {categoriaSelecionada ? ` EM ${categoriaSelecionada.toUpperCase()}` : ' NO CARDÁPIO'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '16px 32px 120px' }}>
        {produtosFiltrados.map(produto => (
          <ProdutoCard key={produto.id} produto={produto} onAdicionar={() => adicionarAoCarrinho(produto)} quantidadeNoCarrinho={carrinho.find(i => i.id === produto.id)?.quantidade || 0} />
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '24px', fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '2px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        DELÍCIAS DA MILA © {new Date().getFullYear()} — FEITO COM ❤️
      </div>

      {showCarrinho && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div onClick={() => { setShowCarrinho(false); setShowFormPedido(false) }} style={{ flex: 1, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

          <div style={{ width: '420px', maxWidth: '100vw', background: '#141414', borderLeft: '1px solid rgba(236,72,153,0.2)', display: 'flex', flexDirection: 'column', animation: 'slideLeft 0.3s ease' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>🛒 Seu Carrinho</div>
                <div style={{ fontSize: '12px', color: '#ec4899', marginTop: '2px' }}>{totalItens} {totalItens === 1 ? 'item' : 'itens'}</div>
              </div>
              <button onClick={() => { setShowCarrinho(false); setShowFormPedido(false) }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {carrinho.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px', color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                  <div>Seu carrinho está vazio</div>
                </div>
              ) : (
                carrinho.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={item.imagemUrl} alt={item.nome} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.nome}</div>
                      <div style={{ color: '#ec4899', fontSize: '14px', marginTop: '2px' }}>R$ {(item.preco * item.quantidade).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => removerDoCarrinho(item.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.3)', background: 'transparent', color: '#ec4899', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantidade}</span>
                      <button onClick={() => adicionarAoCarrinho(item)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.1)', color: '#ec4899', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      <button onClick={() => removerTudo(item.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {carrinho.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '10px' }}>COMO DESEJA RECEBER?</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <TipoBtn label="🛵 Entrega" active={tipoEntrega === 'Entrega'} onClick={() => setTipoEntrega('Entrega')} />
                    <TipoBtn label="🏪 Retirada no balcão" active={tipoEntrega === 'Retirada'} onClick={() => setTipoEntrega('Retirada')} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                    <span>Subtotal</span>
                    <span>R$ {totalPreco.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                    <span style={{ color: tipoEntrega === 'Retirada' ? '#22c55e' : 'rgba(255,255,255,0.5)' }}>
                      {tipoEntrega === 'Retirada' ? '✅ Sem taxa de entrega' : 'Taxa de entrega'}
                    </span>
                    <span style={{ color: tipoEntrega === 'Retirada' ? '#22c55e' : 'rgba(255,255,255,0.5)' }}>
                      {tipoEntrega === 'Retirada' ? 'Grátis' : 'R$ 5,00'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                    <span>Total</span>
                    <span style={{ color: '#ec4899' }}>R$ {totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                {showFormPedido && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>SEUS DADOS</div>
                    <FormInput placeholder="Seu nome" value={form.clienteNome} onChange={e => setForm({ ...form, clienteNome: e.target.value })} />
                    <FormInput placeholder="Telefone (WhatsApp)" value={form.clienteTelefone} onChange={e => setForm({ ...form, clienteTelefone: e.target.value })} />
                    {tipoEntrega === 'Entrega' && (
                      <FormInput placeholder="Endereço de entrega" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
                    )}
                    {tipoEntrega === 'Retirada' && (
                      <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#22c55e' }}>
                        🏪 Você retirará o pedido no balcão
                      </div>
                    )}
                  </div>
                )}

                {!showFormPedido ? (
                  <button onClick={() => setShowFormPedido(true)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ec4899, #be185d)', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif', boxShadow: '0 4px 15px rgba(236,72,153,0.4)' }}>
                    Continuar →
                  </button>
                ) : (
                  <button onClick={handleFinalizarPedido} disabled={enviando} style={{ width: '100%', padding: '14px', background: enviando ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: enviando ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', boxShadow: enviando ? 'none' : '0 4px 15px rgba(34,197,94,0.4)' }}>
                    {enviando ? 'Enviando pedido...' : '✅ Finalizar Pedido'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}

function TipoBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', border: active ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.1)', background: active ? 'rgba(236,72,153,0.15)' : 'transparent', color: active ? '#ec4899' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 'bold', fontFamily: 'Georgia, serif', transition: 'all 0.2s' }}>
      {label}
    </button>
  )
}

function CatBtn({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ padding: '8px 20px', borderRadius: '30px', border: active ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.1)', background: active ? 'linear-gradient(135deg, #ec4899, #be185d)' : hovered ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.03)', color: active ? '#fff' : hovered ? '#ec4899' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: 'Georgia, serif', letterSpacing: '0.5px', boxShadow: active ? '0 4px 15px rgba(236,72,153,0.3)' : 'none' }}>
      {label}
    </button>
  )
}

function ProdutoCard({ produto, onAdicionar, quantidadeNoCarrinho }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'rgba(236,72,153,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hovered ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '20px', overflow: 'hidden', transition: 'all 0.3s ease', transform: hovered ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hovered ? '0 20px 40px rgba(236,72,153,0.15)' : 'none' }}>
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(236,72,153,0.4)', color: '#ec4899', fontSize: '10px', padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px', backdropFilter: 'blur(6px)' }}>
          {produto.categoriaNome?.toUpperCase()}
        </div>
        {quantidadeNoCarrinho > 0 && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ec4899', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
            {quantidadeNoCarrinho}
          </div>
        )}
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: '0 0 6px', color: '#fff' }}>{produto.nome}</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', lineHeight: '1.5' }}>{produto.descricao}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ec4899' }}>R$ {produto.preco.toFixed(2)}</span>
          <button onClick={onAdicionar}
            onMouseEnter={e => { e.target.style.background = 'linear-gradient(135deg, #ec4899, #be185d)'; e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.background = 'rgba(236,72,153,0.15)'; e.target.style.color = '#ec4899' }}
            style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.5)', color: '#ec4899', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Georgia, serif' }}>
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

function FormInput({ placeholder, value, onChange }) {
  return (
    <input placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '11px 14px', borderRadius: '10px', fontSize: '14px', fontFamily: 'Georgia, serif', outline: 'none' }}
      onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
    />
  )
}
