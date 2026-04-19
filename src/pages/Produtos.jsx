import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import logo from '../assets/deliciasdamila.jpeg'
import { useNavigate } from 'react-router-dom'

// ⚠️ SUBSTITUA COM SEUS DADOS DO CLOUDINARY
const CLOUDINARY_CLOUD_NAME = 'dntwemv0c'
const CLOUDINARY_UPLOAD_PRESET = 'vew08q2s'

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadando, setUploadando] = useState(false)
  const [previewImg, setPreviewImg] = useState(null)
  const fileRef = useRef()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nome: '', descricao: '', preco: '',
    imagemUrl: '', disponivel: true, categoriaId: ''
  })

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const [prods, cats] = await Promise.all([
      api.get('/produtos'),
      api.get('/categorias')
    ])
    setProdutos(prods.data)
    setCategorias(cats.data)
    setLoading(false)
  }

  async function handleUploadImagem(e) {
    const file = e.target.files[0]
    if (!file) return

    setPreviewImg(URL.createObjectURL(file))
    setUploadando(true)

    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data
      })
      const json = await res.json()
      setForm(f => ({ ...f, imagemUrl: json.secure_url }))
    } catch {
      alert('Erro ao fazer upload da imagem.')
    } finally {
      setUploadando(false)
    }
  }

  async function handleSalvar() {
    if (!form.nome || !form.preco || !form.categoriaId) {
      alert('Preencha nome, preço e categoria!')
      return
    }
    await api.post('/produtos', {
      ...form,
      preco: parseFloat(form.preco),
      categoriaId: parseInt(form.categoriaId)
    })
    setForm({ nome: '', descricao: '', preco: '', imagemUrl: '', disponivel: true, categoriaId: '' })
    setPreviewImg(null)
    setShowForm(false)
    carregar()
  }

  async function handleDeletar(id) {
    if (confirm('Deseja remover este produto?')) {
      await api.delete(`/produtos/${id}`)
      carregar()
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px'
    }}>
      <img src={logo} alt="logo" style={{
        width: '80px', height: '80px', borderRadius: '20px',
        objectFit: 'cover', objectPosition: 'top',
        border: '2px solid rgba(236,72,153,0.5)',
        animation: 'pulseLogo 1.5s infinite'
      }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif', letterSpacing: '2px', fontSize: '13px' }}>
        CARREGANDO PRODUTOS...
      </p>
      <style>{`@keyframes pulseLogo { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f',
      fontFamily: "'Georgia', serif", color: '#fff',
      position: 'relative', overflow: 'hidden'
    }}>

      {/* Decorativos */}
      <div style={{
        position: 'fixed', top: '-200px', right: '-200px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(15,15,15,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src={logo} alt="logo" style={{
            width: '48px', height: '48px', borderRadius: '12px',
            objectFit: 'cover', objectPosition: 'top',
            border: '2px solid rgba(236,72,153,0.5)',
            boxShadow: '0 4px 20px rgba(236,72,153,0.3)',
            cursor: 'pointer'
          }} onClick={() => navigate('/dashboard')} />
          <div>
            <div style={{
              fontSize: '17px', fontWeight: 'bold',
              background: 'linear-gradient(135deg, #fff, #f9a8d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Delícias da Mila</div>
            <div style={{ fontSize: '11px', color: '#ec4899', letterSpacing: '2px' }}>GERENCIAR PRODUTOS</div>
          </div>
        </div>

        <button
          onClick={() => { setShowForm(!showForm); setPreviewImg(null) }}
          style={{
            background: showForm ? 'transparent' : 'linear-gradient(135deg, #ec4899, #be185d)',
            border: showForm ? '1px solid rgba(236,72,153,0.5)' : 'none',
            color: showForm ? '#ec4899' : '#fff',
            padding: '10px 24px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
            fontFamily: 'Georgia, serif', transition: 'all 0.2s',
            boxShadow: showForm ? 'none' : '0 4px 15px rgba(236,72,153,0.3)'
          }}
        >
          {showForm ? 'Cancelar' : '+ Novo Produto'}
        </button>
      </header>

      {/* Formulário */}
      {showForm && (
        <div style={{
          margin: '24px 32px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(236,72,153,0.2)',
          borderRadius: '20px', padding: '32px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#f9a8d4' }}>
            Novo Produto
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            <Input placeholder="Nome do produto" value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })} />

            <Input placeholder="Preço (ex: 9.50)" value={form.preco} type="number"
              onChange={e => setForm({ ...form, preco: e.target.value })} />

            <div style={{ gridColumn: '1 / -1' }}>
              <Input placeholder="Descrição do produto" value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>

            {/* Upload de imagem */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: '2px dashed rgba(236,72,153,0.4)',
                  borderRadius: '14px', padding: '24px',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s', background: 'rgba(236,72,153,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
                  flexWrap: 'wrap'
                }}
              >
                {previewImg ? (
                  <img src={previewImg} alt="preview" style={{
                    width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover'
                  }} />
                ) : (
                  <div style={{ fontSize: '40px' }}>📷</div>
                )}
                <div>
                  <div style={{ color: '#ec4899', fontWeight: 'bold', fontSize: '15px' }}>
                    {uploadando ? 'Enviando imagem...' : previewImg ? 'Clique para trocar a foto' : 'Clique para adicionar foto'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>
                    JPG, PNG ou WEBP • A imagem será enviada automaticamente
                  </div>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={handleUploadImagem} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <select
                value={form.categoriaId}
                onChange={e => setForm({ ...form, categoriaId: e.target.value })}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', color: form.categoriaId ? '#fff' : 'rgba(255,255,255,0.3)',
                  padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
                  fontFamily: 'Georgia, serif', outline: 'none'
                }}
              >
                <option value="">Selecione a categoria</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ background: '#1a1a1a' }}>
                    {cat.icone} {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              <input type="checkbox" checked={form.disponivel}
                onChange={e => setForm({ ...form, disponivel: e.target.checked })}
                style={{ accentColor: '#ec4899', width: '16px', height: '16px' }} />
              Disponível para venda
            </label>
          </div>

          <button
            onClick={handleSalvar}
            disabled={uploadando}
            style={{
              marginTop: '24px',
              background: uploadando ? 'rgba(236,72,153,0.3)' : 'linear-gradient(135deg, #ec4899, #be185d)',
              border: 'none', color: '#fff', padding: '12px 32px',
              borderRadius: '10px', fontSize: '15px', fontWeight: 'bold',
              cursor: uploadando ? 'not-allowed' : 'pointer',
              fontFamily: 'Georgia, serif',
              boxShadow: uploadando ? 'none' : '0 4px 15px rgba(236,72,153,0.3)'
            }}
          >
            {uploadando ? 'Aguarde o upload...' : 'Salvar Produto'}
          </button>
        </div>
      )}

      {/* Lista de produtos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px', padding: '24px 32px 48px'
      }}>
        {produtos.map(produto => (
          <ProdutoCard key={produto.id} produto={produto} onDeletar={handleDeletar} />
        ))}
      </div>
    </div>
  )
}

function Input({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{
        width: '100%', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', padding: '12px 16px',
        borderRadius: '10px', fontSize: '14px',
        fontFamily: 'Georgia, serif', outline: 'none',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
    />
  )
}

function ProdutoCard({ produto, onDeletar }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(236,72,153,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '20px', overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 40px rgba(236,72,153,0.1)' : 'none'
      }}
    >
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
        <img src={produto.imagemUrl} alt={produto.nome} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 0.4s ease',
          transform: hovered ? 'scale(1.06)' : 'scale(1)'
        }} />
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: produto.disponivel ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
          border: `1px solid ${produto.disponivel ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
          color: produto.disponivel ? '#22c55e' : '#ef4444',
          fontSize: '10px', padding: '3px 10px', borderRadius: '20px',
          letterSpacing: '1px'
        }}>
          {produto.disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
        </div>
      </div>

      <div style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{produto.nome}</h3>
          <span style={{ fontSize: '17px', fontWeight: 'bold', color: '#ec4899' }}>
            R$ {produto.preco.toFixed(2)}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', lineHeight: '1.5' }}>
          {produto.descricao}
        </p>
        <button
          onClick={() => onDeletar(produto.id)}
          style={{
            background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
            color: 'rgba(239,68,68,0.7)', padding: '6px 16px',
            borderRadius: '8px', fontSize: '12px', cursor: 'pointer',
            fontFamily: 'Georgia, serif', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.15)'; e.target.style.color = '#ef4444' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(239,68,68,0.7)' }}
        >
          Remover
        </button>
      </div>
    </div>
  )
}
