import { useEffect, useState, useRef } from "react";
import logo from "../assets/deliciasdamila.jpeg";
import { useNavigate } from "react-router-dom";

const API_URL = "https://delicias-da-mila-api-production.up.railway.app/api";

const STATUS_ENUM = {
  Pendente: 0,
  Confirmado: 1,
  EmPreparo: 2,
  Pronto: 3,
  Entregue: 4,
  Cancelado: 5
};

function imprimirPedido(pedido) {
  const janela = window.open("", "_blank", "width=250,height=500")

  let itensHtml = ""
  pedido.itens?.forEach(item => {
    itensHtml += `
      <div class="item-row">
        <span>${item.quantidade}x ${item.produtoNome}</span>
        <span>R$${item.subtotal.toFixed(2)}</span>
      </div>
    `
  })

  janela.document.write(`
    <html>
      <head>
        <title>Pedido #${pedido.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 9px;
            font-weight: bold;
            color: #000;
            background: #fff;
            width: 52mm;
            padding: 1mm 2mm;
          }
          .center { text-align: center; }
          .bold { font-weight: 900; font-size: 10px; }
          .linha { border-top: 1px dashed #000; margin: 3px 0; }
          .item-row {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            font-weight: bold;
            padding: 1px 0;
            word-break: break-word;
          }
          .item-row span:first-child {
            flex: 1;
            margin-right: 4px;
          }
          .item-row span:last-child {
            white-space: nowrap;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: 900;
            padding: 2px 0;
          }
          .btn {
            display: block;
            width: 100%;
            padding: 6px;
            margin-bottom: 6px;
            background: #ec4899;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
          }
          @media print {
            .btn { display: none; }
            body {
              width: 52mm;
              margin: 0;
              padding: 0 1mm;
            }
            @page {
              size: 58mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <button class="btn" onclick="window.print()">🖨️ Imprimir</button>

        <div class="center bold">DELICIAS DA MILA</div>
        <div class="center">${pedido.tipoEntrega === "Retirada" ? "RETIRADA NO LOCAL" : "DELIVERY"}</div>
        <div class="linha"></div>

        <div>Pedido: #${pedido.id}</div>
        <div>Cliente: ${pedido.clienteNome}</div>
        <div>Tel: ${pedido.clienteTelefone}</div>
        ${pedido.tipoEntrega !== "Retirada" ? `<div>End: ${pedido.endereco}</div>` : ""}
        <div>Data: ${new Date(pedido.criadoEm).toLocaleString("pt-BR")}</div>

        <div class="linha"></div>
        <div class="bold">ITENS:</div>
        ${itensHtml}
        <div class="linha"></div>

        ${pedido.tipoEntrega !== "Retirada" ? `
        <div class="item-row">
          <span>Taxa entrega</span>
          <span>R$5,00</span>
        </div>` : ""}

        <div class="total-row">
          <span>TOTAL</span>
          <span>R$${pedido.total.toFixed(2)}</span>
        </div>

        <div class="linha"></div>
        <div>Pgto: ${pedido.formaPagamento || "Nao informado"}</div>
        ${pedido.formaPagamento === "Dinheiro" && pedido.troco > 0 ? `<div>Troco: R$${pedido.troco.toFixed(2)}</div>` : ""}
        ${pedido.formaPagamento === "Pix" ? `<div>Pix: 81997307264</div>` : ""}

        <div class="linha"></div>
        <div class="center">Obrigado!</div>
        <br>
      </body>
    </html>
  `)
  janela.document.close()
  janela.focus()
  setTimeout(() => { janela.print() }, 600)
}

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [novoPedido, setNovoPedido] = useState(false);
  const [hora, setHora] = useState("");
  const ultimoIdRef = useRef(null);
  const navigate = useNavigate();

  const tocarSom = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const buscarPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/Pedidos`);
      const data = await res.json();
      if (data.length > 0) {
        const idMaisRecente = data[0].id;
        if (ultimoIdRef.current === null) {
          ultimoIdRef.current = idMaisRecente;
        } else if (idMaisRecente > ultimoIdRef.current) {
          tocarSom();
          ultimoIdRef.current = idMaisRecente;
          setNovoPedido(true);
          setTimeout(() => setNovoPedido(false), 4000);
        }
      } else {
        if (ultimoIdRef.current === null) ultimoIdRef.current = 0;
      }
      setPedidos(data);
    } catch (error) {
      console.error("Erro ao buscar pedidos", error);
    }
  };

  const atualizarStatus = async (id, status, pedido) => {
    try {
      const res = await fetch(`${API_URL}/Pedidos/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        if (status === STATUS_ENUM.EmPreparo && pedido) {
          imprimirPedido(pedido)
        }
        await buscarPedidos();
      }
    } catch (error) {
      console.error("Erro ao atualizar status", error);
    }
  };

  useEffect(() => {
    buscarPedidos();
    const intervalo = setInterval(buscarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const atualizar = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    atualizar();
    const interval = setInterval(atualizar, 1000);
    return () => clearInterval(interval);
  }, []);

  const pedidosHoje = pedidos.filter(p => new Date(p.criadoEm).toDateString() === new Date().toDateString()).length;
  const totalHoje = pedidos.filter(p => new Date(p.criadoEm).toDateString() === new Date().toDateString()).reduce((acc, p) => acc + p.total, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Georgia', serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {novoPedido && (
        <div style={{ position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #ec4899, #be185d)", color: "#fff", padding: "16px 32px", borderRadius: "14px", fontSize: "15px", fontWeight: "bold", zIndex: 999, boxShadow: "0 8px 30px rgba(236,72,153,0.5)", animation: "slideDown 0.3s ease", whiteSpace: "nowrap" }}>
          🔔 Novo pedido chegou!
        </div>
      )}

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(15,15,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img src={logo} alt="logo" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", objectPosition: "top", border: "2px solid rgba(236,72,153,0.5)", boxShadow: "0 4px 20px rgba(236,72,153,0.3)", cursor: "pointer" }} onClick={() => navigate("/dashboard")} />
          <div>
            <div style={{ fontSize: "17px", fontWeight: "bold", background: "linear-gradient(135deg, #fff, #f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Delícias da Mila</div>
            <div style={{ fontSize: "11px", color: "#ec4899", letterSpacing: "2px" }}>PEDIDOS EM TEMPO REAL</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            Ao vivo • atualiza a cada 5s
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#ec4899", fontFamily: "monospace" }}>{hora}</div>
        </div>
      </header>

      <main style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <StatCard emoji="📦" label="Pedidos hoje" value={pedidosHoje} cor="236,72,153" />
          <StatCard emoji="💰" label="Faturamento hoje" value={`R$ ${totalHoje.toFixed(2)}`} cor="34,197,94" />
          <StatCard emoji="🕐" label="Último pedido" cor="249,115,22" value={pedidos.length > 0 ? new Date(pedidos[0].criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"} />
        </div>

        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", marginBottom: "16px" }}>
          {pedidos.length} {pedidos.length === 1 ? "PEDIDO" : "PEDIDOS"} NO TOTAL
        </div>

        {pedidos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
            <div style={{ fontSize: "18px" }}>Nenhum pedido ainda</div>
            <div style={{ fontSize: "13px", marginTop: "8px" }}>Os pedidos aparecerão aqui automaticamente</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pedidos.map((p, index) => (
              <PedidoCard key={p.id} pedido={p} isNovo={index === 0 && novoPedido} onAtualizarStatus={atualizarStatus} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes slideDown { from{transform:translateX(-50%) translateY(-20px);opacity:0;} to{transform:translateX(-50%) translateY(0);opacity:1;} }
        @keyframes glowBorder { 0%,100%{box-shadow:0 0 20px rgba(236,72,153,0.5);} 50%{box-shadow:none;} }
      `}</style>
    </div>
  );
}

function StatCard({ emoji, label, value, cor }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ fontSize: "24px", width: "52px", height: "52px", borderRadius: "14px", background: `rgba(${cor},0.15)`, display: "flex", alignItems: "center", justifyContent: "center" }}>{emoji}</div>
      <div>
        <div style={{ fontSize: "22px", fontWeight: "bold", color: `rgb(${cor})` }}>{value}</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{label}</div>
      </div>
    </div>
  );
}

function PedidoCard({ pedido, isNovo, onAtualizarStatus }) {
  const [expandido, setExpandido] = useState(true);
  const [carregando, setCarregando] = useState(false);

  const statusMap = {
    "Pendente":   { cor: "249,115,22", label: "🟡 Pendente" },
    "Confirmado": { cor: "59,130,246", label: "🔵 Confirmado" },
    "EmPreparo":  { cor: "236,72,153", label: "🔴 Em Preparo" },
    "Pronto":     { cor: "168,85,247", label: "🟣 Pronto" },
    "Entregue":   { cor: "34,197,94",  label: "🟢 Entregue" },
    "Cancelado":  { cor: "239,68,68",  label: "⚫ Cancelado" },
  };
  const status = statusMap[pedido.status] || { cor: "249,115,22", label: pedido.status };
  const pagamentoIcon = { "Dinheiro": "💵", "Pix": "🔑", "Cartão": "💳" };

  async function handleStatus(novoStatus) {
    setCarregando(true);
    await onAtualizarStatus(pedido.id, STATUS_ENUM[novoStatus], pedido);
    setCarregando(false);
  }

  return (
    <div style={{ background: isNovo ? "rgba(236,72,153,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${isNovo ? "rgba(236,72,153,0.6)" : "rgba(255,255,255,0.07)"}`, borderRadius: "18px", overflow: "hidden", transition: "all 0.3s", animation: isNovo ? "glowBorder 1s infinite" : "none" }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(236,72,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>#{pedido.id} — {pedido.clienteNome}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
              {pedido.tipoEntrega === "Retirada" ? "🏪 Retirada no balcão" : `📍 ${pedido.endereco}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: `rgba(${status.cor},0.15)`, border: `1px solid rgba(${status.cor},0.4)`, color: `rgb(${status.cor})`, padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>{status.label}</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#ec4899" }}>R$ {pedido.total.toFixed(2)}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "18px", transition: "transform 0.2s", transform: expandido ? "rotate(180deg)" : "rotate(0deg)" }}>▾</div>
        </div>
      </div>

      {expandido && (
        <div style={{ padding: "0 24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ paddingTop: "16px", marginBottom: "12px", fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>ITENS DO PEDIDO</div>
          {pedido.itens?.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ background: "rgba(236,72,153,0.15)", color: "#ec4899", width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>{item.quantidade}</span>
                <span>{item.produtoNome}</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>R$ {item.subtotal.toFixed(2)}</span>
            </div>
          ))}

          <div style={{ marginTop: "14px", marginBottom: "12px", display: "flex", justifyContent: "space-between", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            <span>📞 {pedido.clienteTelefone}</span>
            <span>{pedido.tipoEntrega === "Retirada" ? "🏪 Retirada no balcão" : "🛵 Taxa de entrega: R$ 5,00"}</span>
          </div>

          {pedido.formaPagamento && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
              <span style={{ fontSize: "18px" }}>{pagamentoIcon[pedido.formaPagamento] || "💳"}</span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>
                {pedido.formaPagamento}
                {pedido.formaPagamento === "Dinheiro" && pedido.troco > 0 && ` — Troco para R$ ${pedido.troco.toFixed(2)}`}
                {pedido.formaPagamento === "Pix" && " — Chave: 81997307264"}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {pedido.status === "Pendente" && (
              <>
                <BotaoAcao label={carregando ? "Aguarde..." : "🔴 Iniciar Preparo"} cor="236,72,153" onClick={() => handleStatus("EmPreparo")} disabled={carregando} />
                <BotaoAcao label="⚫ Cancelar" cor="239,68,68" outline onClick={() => handleStatus("Cancelado")} disabled={carregando} />
              </>
            )}
            {pedido.status === "EmPreparo" && (
              <BotaoAcao label={carregando ? "Aguarde..." : "🟣 Pedido Pronto"} cor="168,85,247" onClick={() => handleStatus("Pronto")} disabled={carregando} />
            )}
            {pedido.status === "Pronto" && (
              <BotaoAcao label={carregando ? "Aguarde..." : "🟢 Finalizar Pedido"} cor="34,197,94" onClick={() => handleStatus("Entregue")} disabled={carregando} />
            )}
            {pedido.status === "Entregue" && (
              <div style={{ fontSize: "13px", color: "rgba(34,197,94,0.7)", padding: "8px 0" }}>✅ Pedido finalizado e entregue</div>
            )}
            {pedido.status === "Cancelado" && (
              <div style={{ fontSize: "13px", color: "rgba(239,68,68,0.7)", padding: "8px 0" }}>❌ Pedido cancelado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BotaoAcao({ label, cor, onClick, disabled, outline }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ padding: "10px 20px", borderRadius: "10px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "bold", transition: "all 0.2s", background: outline ? hovered ? `rgba(${cor},0.15)` : "transparent" : hovered ? `rgba(${cor},0.8)` : `rgba(${cor},0.2)`, border: `1px solid rgba(${cor},0.5)`, color: `rgb(${cor})`, boxShadow: hovered && !outline ? `0 4px 15px rgba(${cor},0.3)` : "none", opacity: disabled ? 0.6 : 1 }}>
      {label}
    </button>
  );
}

export default Pedidos;
