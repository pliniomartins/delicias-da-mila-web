const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'public/favicon.svg'),
    title: 'Delícias da Mila'
  })

  win.loadURL('https://elegant-cascaron-cf099a.netlify.app')
  win.setMenuBarVisibility(false)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
