const { app, BrowserWindow, protocol } = require('electron')
const path = require('path')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    icon: path.join(__dirname, 'public/icon.ico'),
    title: 'Delícias da Mila'
  })

  win.setMenuBarVisibility(false)
  win.webContents.openDevTools()
  win.loadFile(path.join(__dirname, 'dist', 'index.html'))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
