import { useEffect, useState } from 'react'
import api from '../services/api'
import logo from '../assets/deliciasdamila.jpeg'

const TEMPO_ESPERA = "20 a 60"

const BAIRROS = [
  { nome: 'Caetés 1', taxa: 2.00 },
  { nome: 'Caetés 2', taxa: 3.00 },
  { nome: 'Caetés 3', taxa: 4.00 },
  { nome: 'Caetés Velho', taxa: 3.00 },
  { nome: 'Fosfato', taxa: 5.00 },
  { nome: 'Planalto', taxa: 5.00 },
  { nome: 'Matinha', taxa: 6.00 },
  { nome: 'Alto São Miguel', taxa: 6.00 },
  { nome: 'Desterro', taxa: 7.00 },
  { nome: 'Alto Bela Vista', taxa: 5.00 },
  { nome: 'Abreu Centro', taxa: 5.00 },
  { nome: 'Paratibe', taxa: 7.00 },
  { nome: 'Timbó', taxa: 5.00 },
  { nome: 'Jaguaribe', taxa: 6.00 },
  { nome: 'PE-18', taxa: 4.00 },
  { nome: 'Quartzolit', taxa: 4.00 },
]

function estaAberto(adminMode = false) {
  if (adminMode) return true
  const agora = new Date()
  const total = agora.getHours() * 60 + agora.getMinutes()
  return total >= 16 * 60
}

export default function Cardapio({ adminMode = false }) {
  const [categorias, setCategorias] = useState([])
  const [produtos, setProdutos] = useState([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [carrinho, setCarrinho] = useState([])
  const [tela, setTela] = useState('cardapio')
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [tipoEntrega, setTipoEntrega] = useState('Entrega')
  const [bairroSelecionado, setBairroSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [troco, setTroco] = useState('')
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

  const produtosFiltrados = produtos
    .filter(p => p.disponivel)
    .filter(p => categoriaSelecionada ? p.categoriaNome === categoriaSelecionada : true)

  const totalItens = carrinho.reduce((acc, i) => acc + i.quantidade, 0)
  const totalPreco = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0)
  const bairroInfo = BAIRROS.find(b => b.nome === bairroSelecionado)
  const taxaEntrega = tipoEntrega === 'Entrega' ? (bairroInfo?.taxa || 0) : 0
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
    if (tipoEntrega === 'Entrega' && !bairroSelecionado) {
      alert('Selecione o bairro!')
      return
    }
    if (!formaPagamento) {
      alert('Selecione a forma de pagamento!')
      return
    }
    setEnviando(true)
    try {
      const now = new Date()
      const previsao = new Date(now.getTime() + 40 * 60000)
        .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      const enderecoCompleto = tipoEntrega === 'Retirada'
        ? 'Retirada no balcão'
        : `${form.endereco} - ${bairroSelecionado}`

      const response = await api.post('/pedidos', {
        clienteNome: form.clienteNome,
        clienteTelefone: form.clienteTelefone,
        endereco: enderecoCompleto,
        tipoEntrega,
        formaPagamento,
        troco: formaPagamento === 'Dinheiro' && troco ? parseFloat(troco) : 0,
        taxaEntrega,
        itens: carrinho.map(i => ({ produtoId: i.id, quantidade: i.quantidade }))
      })

      setCarrinho([])
      setForm({ clienteNome: '', clienteTelefone: '', endereco: '' })
      setTipoEntrega('Entrega')
      setBairroSelecionado('')
      setFormaPagamento('')
      setTroco('')

      setPedidoConfirmado({
        tempoEspera: response.data.tempoEspera || TEMPO_ESPERA,
        previsao: response.data.previsao || previsao,
        pedidoId: response.data.pedidoId,
        whatsapp: response.data.whatsapp
      })
      setTela('confirmado')

    } catch {
      alert('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (!estaAberto(adminMode)) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Georgia, serif', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      <img src={logo} alt='logo' style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover', objectPosition: 'top', border: '3px solid rgba(236,72,153,0.5)', marginBottom: '24px', boxShadow: '0 8px 40px rgba(236,72,153,0.3)' }} />
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌙</div>
      <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>Estamos fechados</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', marginBottom: '32px', maxWidth: '320px' }}>Nosso horário de funcionamento é das 16h às 00h. Volte em breve!</p>
      <div style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '16px', padding: '20px 32px' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '8px' }}>HORÁRIO DE FUNCIONAMENTO</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ec4899' }}>16:00 — 00:00</div>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <img src={logo} alt='logo' style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', objectPosition: 'top', border: '2px solid rgba(236,72,153,0.5)', animation: 'pulseLogo 1.5s infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif', letterSpacing: '2px', fontSize: '13px' }}>CARREGANDO CARDÁPIO...</p>
      <style>{`@keyframes pulseLogo { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
    </div>
  )

  // ✅ TELA DE CONFIRMAÇÃO
  if (tela === 'confirmado') return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'Georgia', serif", color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>✅</div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>
        Pedido #{pedidoConfirmado?.pedidoId} enviado!
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '24px' }}>
        Clique abaixo para confirmar pelo WhatsApp 👇
      </p>
      {pedidoConfirmado?.whatsapp && (
        <a href={pedidoConfirmado.whatsapp} style={{ display: 'block', width: '100%', maxWidth: '320px', padding: '16px', background: 'linear-gradient(135deg, #25d366, #128c7e)', color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif', textAlign: 'center', textDecoration: 'none', marginBottom: '16px', boxShadow: '0 4px 20px rgba(37,211,102,0.4)' }}>
          📲 Confirmar pedido no WhatsApp
        </a>
      )}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '20px', padding: '24px 32px', marginBottom: '20px', width: '100%', maxWidth: '320px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>⏱️</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '6px' }}>TEMPO ESTIMADO</div>
        <div style={{ fontSize: '44px', fontWeight: 'bold', color: '#ec4899', marginBottom: '4px', lineHeight: 1 }}>{TEMPO_ESPERA}</div>
        <div style={{ fontSize: '18px', color: '#ec4899', marginBottom: '10px' }}>minutos</div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
          Previsão: até às <strong style={{ color: '#fff' }}>{pedidoConfirmado?.previsao}</strong>
        </div>
      </div>
      <button onClick={() => setTela('cardapio')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 32px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', width: '100%', maxWidth: '320px' }}>
        Voltar ao cardápio
      </button>
    </div>
  )

  // 🛒 TELA DO CARRINHO
  if (tela === 'carrinho') return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'Georgia', serif", color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(15,15,15,0.95)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setTela('cardapio')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', flexShrink: 0 }}>←</button>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>🛒 Seu Carrinho</div>
          <div style={{ fontSize: '12px', color: '#ec4899' }}>{totalItens} {totalItens === 1 ? 'item' : 'itens'}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
        {carrinho.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
            <div>Seu carrinho está vazio</div>
          </div>
        ) : (
          carrinho.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={item.imagemUrl} alt={item.nome} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome}</div>
                <div style={{ color: '#ec4899', fontSize: '13px', marginTop: '2px' }}>R$ {(item.preco * item.quantidade).toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => removerDoCarrinho(item.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.3)', background: 'transparent', color: '#ec4899', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantidade}</span>
                <button onClick={() => adicionarAoCarrinho(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.1)', color: '#ec4899', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                <button onClick={() => removerTudo(item.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {carrinho.length > 0 && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#141414' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '8px' }}>COMO DESEJA RECEBER?</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <TipoBtn label="🛵 Entrega" active={tipoEntrega === 'Entrega'} onClick={() => setTipoEntrega('Entrega')} />
              <TipoBtn label="🏪 Retirada" active={tipoEntrega === 'Retirada'} onClick={() => setTipoEntrega('Retirada')} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
            <span>Subtotal</span><span>R$ {totalPreco.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
            <span style={{ color: tipoEntrega === 'Retirada' ? '#22c55e' : 'rgba(255,255,255,0.5)' }}>
              {tipoEntrega === 'Retirada' ? '✅ Sem taxa' : bairroSelecionado ? `Taxa - ${bairroSelecionado}` : 'Taxa de entrega'}
            </span>
            <span style={{ color: tipoEntrega === 'Retirada' ? '#22c55e' : 'rgba(255,255,255,0.5)' }}>
              {tipoEntrega === 'Retirada' ? 'Grátis' : bairroSelecionado ? `R$ ${taxaEntrega.toFixed(2)}` : 'Selecione o bairro'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '14px' }}>
            <span>Total</span>
            <span style={{ color: '#ec4899' }}>R$ {totalFinal.toFixed(2)}</span>
          </div>
          <button onClick={() => setTela('dados')} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #ec4899, #be185d)', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            Continuar →
          </button>
        </div>
      )}
    </div>
  )

  // 📝 TELA DE DADOS
  if (tela === 'dados') return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'Georgia', serif", color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(15,15,15,0.95)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setTela('carrinho')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', flexShrink: 0 }}>←</button>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>📝 Seus Dados</div>
          <div style={{ fontSize: '12px', color: '#ec4899' }}>Preencha para finalizar</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>SEUS DADOS</div>
          <FormInput placeholder="Seu nome" value={form.clienteNome} onChange={e => setForm({ ...form, clienteNome: e.target.value })} />
          <FormInput placeholder="Telefone (WhatsApp)" value={form.clienteTelefone} onChange={e => setForm({ ...form, clienteTelefone: e.target.value })} type="tel" />

          {tipoEntrega === 'Entrega' && (
            <>
              {/* Dropdown de bairro */}
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>SEU BAIRRO</div>
              <select
                value={bairroSelecionado}
                onChange={e => setBairroSelecionado(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '13px 14px', borderRadius: '10px', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none' }}
              >
                <option value=''>Selecione seu bairro</option>
                <option value='Caetés 1'>Caetés 1 — R$ 2,00</option>
                <option value='Caetés 2'>Caetés 2 — R$ 3,00</option>
                <option value='Caetés 3'>Caetés 3 — R$ 4,00</option>
                <option value='Caetés Velho'>Caetés Velho — R$ 3,00</option>
                <option value='Fosfato'>Fosfato — R$ 5,00</option>
                <option value='Planalto'>Planalto — R$ 5,00</option>
                <option value='Matinha'>Matinha — R$ 6,00</option>
                <option value='Alto São Miguel'>Alto São Miguel — R$ 6,00</option>
                <option value='Desterro'>Desterro — R$ 7,00</option>
                <option value='Alto Bela Vista'>Alto Bela Vista — R$ 5,00</option>
                <option value='Abreu Centro'>Abreu Centro — R$ 5,00</option>
                <option value='Paratibe'>Paratibe — R$ 7,00</option>
                <option value='Timbó'>Timbó — R$ 5,00</option>
                <option value='Jaguaribe'>Jaguaribe — R$ 6,00</option>
                <option value='PE-18'>PE-18 — R$ 4,00</option>
                <option value='Quartzolit'>Quartzolit — R$ 4,00</option>
              </select>

              {bairroSelecionado && (
                <div style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#ec4899', textAlign: 'center' }}>
                  🛵 Taxa de entrega para {bairroSelecionado}: <strong>R$ {bairroInfo?.taxa.toFixed(2)}</strong>
                </div>
              )}

              <FormInput placeholder="Endereço completo (rua, número)" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            </>
          )}

          {tipoEntrega === 'Retirada' && (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#22c55e' }}>
              🏪 Você retirará o pedido no balcão
            </div>
          )}

          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginTop: '8px' }}>FORMA DE PAGAMENTO</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Dinheiro', 'Pix', 'Cartão'].map(op => (
              <button key={op} onClick={() => setFormaPagamento(op)} style={{ flex: 1, padding: '10px 4px', borderRadius: '10px', cursor: 'pointer', border: formaPagamento === op ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.1)', background: formaPagamento === op ? 'rgba(236,72,153,0.15)' : 'transparent', color: formaPagamento === op ? '#ec4899' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                {op === 'Dinheiro' ? '💵' : op === 'Pix' ? '🔑' : '💳'}<br />{op}
              </button>
            ))}
          </div>

          {formaPagamento === 'Dinheiro' && (
            <FormInput placeholder="Troco para quanto? (ex: 50.00)" value={troco} onChange={e => setTroco(e.target.value)} type="number" />
          )}

          {formaPagamento === 'Pix' && (
            <div style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>CHAVE PIX</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ec4899' }}>81997307264</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Envie o comprovante pelo WhatsApp</div>
            </div>
          )}

          <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#f97316', textAlign: 'center', marginTop: '4px' }}>
            ⏱️ Tempo estimado: <strong>{TEMPO_ESPERA} minutos</strong>
          </div>

          {/* Resumo */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>RESUMO</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
              <span>Subtotal</span><span>R$ {totalPreco.toFixed(2)}</span>
            </div>
            {tipoEntrega === 'Entrega' && bairroSelecionado && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                <span>Taxa - {bairroSelecionado}</span><span>R$ {taxaEntrega.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Total</span><span style={{ color: '#ec4899' }}>R$ {totalFinal.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ height: '20px' }} />
        </div>
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0f0f0f' }}>
        <button onClick={handleFinalizarPedido} disabled={enviando} style={{ width: '100%', padding: '16px', background: enviando ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: enviando ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}>
          {enviando ? 'Enviando...' : '✅ Finalizar Pedido'}
        </button>
      </div>
    </div>
  )

  // 🍫 TELA DO CARDÁPIO
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'Georgia', serif", color: '#fff', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,15,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="logo" style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', objectPosition: 'top', border: '2px solid rgba(236,72,153,0.5)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(135deg, #fff, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Delícias da Mila</div>
            <div style={{ fontSize: '10px', color: '#ec4899', letterSpacing: '2px' }}>CARDÁPIO</div>
          </div>
        </div>
        <button onClick={() => setTela('carrinho')} style={{ background: totalItens > 0 ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(236,72,153,0.4)', color: '#fff', padding: '8px 14px', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          🛒
          {totalItens > 0 && <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{totalItens} • R$ {totalFinal.toFixed(2)}</span>}
          {totalItens === 0 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Carrinho</span>}
        </button>
      </header>

      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <CatBtn label="Todos" active={!categoriaSelecionada} onClick={() => setCategoriaSelecionada(null)} />
        {categorias.map(cat => (
          <CatBtn key={cat.id} label={cat.nome} active={categoriaSelecionada === cat.nome} onClick={() => setCategoriaSelecionada(cat.nome)} />
        ))}
      </div>

      <div style={{ padding: '14px 16px 8px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '1px' }}>
        {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'ITEM' : 'ITENS'}
        {categoriaSelecionada ? ` EM ${categoriaSelecionada.toUpperCase()}` : ' NO CARDÁPIO'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '8px 16px 80px' }}>
        {produtosFiltrados.map(produto => (
          <ProdutoCard key={produto.id} produto={produto} onAdicionar={() => adicionarAoCarrinho(produto)} quantidadeNoCarrinho={carrinho.find(i => i.id === produto.id)?.quantidade || 0} />
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '24px', fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '2px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        DELÍCIAS DA MILA © {new Date().getFullYear()} — FEITO COM ❤️
      </div>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        input, select { font-size: 16px !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

function TipoBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: '10px 6px', borderRadius: '10px', cursor: 'pointer', border: active ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.1)', background: active ? 'rgba(236,72,153,0.15)' : 'transparent', color: active ? '#ec4899' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
      {label}
    </button>
  )
}

function CatBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 16px', borderRadius: '30px', border: active ? '1px solid #ec4899' : '1px solid rgba(255,255,255,0.1)', background: active ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'rgba(255,255,255,0.03)', color: active ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif', flexShrink: 0 }}>
      {label}
    </button>
  )
}

function ProdutoCard({ produto, onAdicionar, quantidadeNoCarrinho }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img src={produto.imagemUrl} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(236,72,153,0.4)', color: '#ec4899', fontSize: '10px', padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px' }}>
          {produto.categoriaNome?.toUpperCase()}
        </div>
        {quantidadeNoCarrinho > 0 && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ec4899', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
            {quantidadeNoCarrinho}
          </div>
        )}
      </div>
      <div style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px', color: '#fff' }}>{produto.nome}</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', lineHeight: '1.5' }}>{produto.descricao}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ec4899' }}>R$ {produto.preco.toFixed(2)}</span>
          <button onClick={onAdicionar} style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.5)', color: '#ec4899', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

function FormInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '13px 14px', borderRadius: '10px', fontSize: '16px', fontFamily: 'Georgia, serif', outline: 'none' }}
      onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
    />
  )
}
