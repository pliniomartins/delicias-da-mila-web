const { app, BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')

const URL_LOCAL = 'http://localhost:5028'
const URL_ONLINE = 'https://elegant-cascaron-cf099a.netlify.app'

function verificarAPILocal() {
  return new Promise((resolve) => {
    const req = http.get(`${URL_LOCAL}/api/Produtos`, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(2000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'public/icon.ico'),
    title: 'Delícias da Mila'
  })

  win.setMenuBarVisibility(false)

  // Verifica se a API local está disponível
  const apiLocalDisponivel = await verificarAPILocal()

  if (apiLocalDisponivel) {
    // Usa o site online mas com API local via redirecionamento
    win.loadURL(URL_ONLINE)
    // Injeta a URL da API local no localStorage
    win.webContents.on('did-finish-load', () => {
      win.webContents.executeJavaScript(`
        localStorage.setItem('API_URL', '${URL_LOCAL}/api');
        console.log('Usando API local: ${URL_LOCAL}');
      `)
    })
  } else {
    win.loadURL(URL_ONLINE)
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
