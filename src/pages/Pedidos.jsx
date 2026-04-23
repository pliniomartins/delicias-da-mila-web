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
  const janela = window.open('', '_blank', 'width=300,height=600')
  let itensHtml = ''
  pedido.itens?.forEach(item => {
    itensHtml += `<tr><td style="padding:1px 0;word-break:break-word;">(${item.quantidade}) ${item.produtoNome}</td><td style="padding:1px 0;text-align:right;white-space:nowrap;padding-left:4px;">R$ ${item.subtotal.toFixed(2)}</td></tr>`
  })
  janela.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido #${pedido.id}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;font-size:8pt;font-weight:bold;color:#000;background:#fff;padding:2mm 3mm;}table{width:100%;border-collapse:collapse;}td{font-size:8pt;font-weight:bold;vertical-align:top;}.center{text-align:center;}.sep{border-top:1px dashed #000;margin:2px 0;}.btn{display:block;width:100%;padding:8px;margin-bottom:8px;background:#ec4899;color:white;border:none;border-radius:6px;font-size:13px;font-weight:bold;cursor:pointer;}@media print{.btn{display:none;}@page{size:55mm auto;margin:0mm 2mm;}}</style></head><body><button class="btn" onclick="window.print()">Imprimir</button><div class="center"><b>DELICIAS DA MILA</b></div><div class="center">${pedido.tipoEntrega === 'Retirada' ? 'RETIRADA NO LOCAL' : 'DELIVERY'}</div><div class="sep"></div><table><tr><td colspan="2">Pedido: #${pedido.id}</td></tr><tr><td colspan="2">Cliente: ${pedido.clienteNome}</td></tr><tr><td colspan="2">Tel: ${pedido.clienteTelefone}</td></tr>${pedido.tipoEntrega !== 'Retirada' ? `<tr><td colspan="2">End: ${pedido.endereco}</td></tr>` : ''}<tr><td colspan="2">Data: ${new Date(pedido.criadoEm).toLocaleString('pt-BR')}</td></tr></table><div class="sep"></div><table><tr><td><b>Itens</b></td><td style="text-align:right"><b>R$</b></td></tr>${itensHtml}</table><div class="sep"></div><table>${pedido.tipoEntrega !== 'Retirada' ? `<tr><td>Taxa entrega</td><td style="text-align:right">R$ 5,00</td></tr>` : `<tr><td>Retirada no local</td><td style="text-align:right">Gratis</td></tr>`}<tr><td><b>TOTAL</b></td><td style="text-align:right"><b>R$ ${pedido.total.toFixed(2)}</b></td></tr></table><div class="sep"></div><table><tr><td colspan="2">Pgto: ${pedido.formaPagamento || 'Nao informado'}</td></tr>${pedido.formaPagamento === 'Dinheiro' && pedido.troco > 0 ? `<tr><td colspan="2">Troco: R$ ${pedido.troco.toFixed(2)}</td></tr>` : ''}${pedido.formaPagamento === 'Pix' ? `<tr><td colspan="2">Pix: 81997307264</td></tr>` : ''}</table><div class="sep"></div><div class="center">Obrigado pela preferencia!</div></body></html>`)
  janela.document.close()
  janela.focus()
  setTimeout(() => { janela.print() }, 800)
}
