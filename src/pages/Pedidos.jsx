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
  const sep = "********************************";
  const linha = "--------------------------------";
  const pontilhado = "................................";

  let texto = `${sep}\n`;
  texto += `       DELICIAS DA MILA\n`;
  texto += `${sep}\n\n`;
  texto += pedido.tipoEntrega === "Retirada"
    ? `       RETIRADA NO LOCAL\n`
    : `           DELIVERY\n`;
  texto += `${pontilhado}\n`;
  texto += `Cliente: ${pedido.clienteNome}\n`;
  texto += `Tel: ${pedido.clienteTelefone}\n`;
  if (pedido.tipoEntrega !== "Retirada") texto += `End: ${pedido.endereco}\n`;
  texto += `Data: ${new Date(pedido.criadoEm).toLocaleString("pt-BR")}\n`;
  texto += `Pedido #${pedido.id}\n`;
  texto += `${pontilhado}\n\n`;
  texto += `Itens\n`;
  texto += `${linha}\n`;

  pedido.itens?.forEach(item => {
    texto += `(${item.quantidade}) ${item.produtoNome}\n`;
    texto += `   R$ ${item.precoUnitario.toFixed(2)} x ${item.quantidade} = R$ ${item.subtotal.toFixed(2)}\n`;
  });

  texto += `${linha}\n`;
  if (pedido.tipoEntrega !== "Retirada")
    texto += `Taxa de entrega:        R$ 5,00\n`;
  else
    texto += `Retirada no local:      Gratis\n`;
  texto += `${linha}\n`;
  texto += `Total:                 R$ ${pedido.total.toFixed(2)}\n`;
  texto += `${pontilhado}\n`;
  texto += `Pagamento: ${pedido.formaPagamento || "Nao informado"}\n`;
  if (pedido.formaPagamento === "Dinheiro" && pedido.troco > 0)
    texto += `Troco para: R$ ${pedido.troco.toFixed(2)}\n`;
  if (pedido.formaPagamento === "Pix")
    texto += `Chave Pix: 81997307264\n`;
  texto += `${sep}\n`;
  texto += `  Agradecemos pela preferencia!\n`;
  texto += `${sep}\n`;

  const janela = window.open("", "_blank", "width=400,height=600")
  janela.document.write(`
    <html>
      <head>
        <title>Pedido #${pedido.id} - Delicias da Mila</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            font-weight: 900;
            color: #000000;
            background: #ffffff;
            padding: 10px;
            white-space: pre;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .btn-imprimir {
            display: block;
            width: 100%;
            padding: 12px;
            margin-bottom: 12px;
            background: #ec4899;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
          }
          @media print {
            .btn-imprimir { display: none; }
            body { 
              padding: 0;
              font-size: 13px;
              font-weight: 900;
              color: #000000;
            }
          }
        </style>
      </head>
      <body>
        <button class="btn-imprimir" onclick="window.print();">
          🖨️ Imprimir Pedido
        </button>
        ${texto.replace(/\n/g, '<br>')}
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

