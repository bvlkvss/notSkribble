const {
  app,
  BrowserWindow
} = require('electron')
const url = require("url");
const path = require("path");
process.setMaxListeners(0);
// const { childOfKind } = require('tslint');

let appWindow
let chatWindow

function initWindow() {
  appWindow = new BrowserWindow({
    height: 1200,
    width: 1920,
    x: 0,
    y: 0,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
    resizable: false
  })
  appWindow.setSize(1550, 830);
  chatWindow = new BrowserWindow({
    height: 1200,
    width: 530,
    y: 0,
    x: 1010,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    resizable: false
  })
  chatWindow.setSize(530, 855);

  // Electron Build Path
  appWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/client/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  let option = { hash: "/chat" };
  chatWindow.loadFile(
    `./dist/client/index.html`,
    option
  );

  appWindow.setMenuBarVisibility(false)
  chatWindow.setMenuBarVisibility(false)

  const { ipcMain } = require('electron')

  ipcMain.on('merge-window', (event, arg) => {
    try {
      appWindow.setResizable(true);
      appWindow.setSize(1550, 840);
      appWindow.setResizable(false);
      chatWindow.hide();
      appWindow.webContents.send('simple-window');
    } catch (error) { }
  });

  ipcMain.on('resize-game-window', (event, arg) => {
    try {
      appWindow.setResizable(true);
      appWindow.setSize(1020, 840);
      appWindow.setResizable(false);
      chatWindow.show();
      appWindow.webContents.send('dual-window');
      appWindow.webContents.send('get-joined-rooms');
    } catch (error) { }
  });

  ipcMain.on('get-joined-rooms', (event, arg) => {
    try {
      appWindow.webContents.send('get-joined-rooms', arg);
    } catch (error) { }
  })

  ipcMain.on('joined-rooms', (event, arg) => {
    try {
      chatWindow.webContents.send('joined-rooms', arg);
    } catch (error) { }
  })

  ipcMain.on('get-all-rooms', (event, arg) => {
    appWindow.webContents.send('get-available-rooms');
  })

  ipcMain.on('available-rooms', (event, arg) => {
    chatWindow.webContents.send('available-rooms', arg);
  });

  ipcMain.on('quit-room', (event, arg) => {
    try {
      appWindow.webContents.send('quit-room', arg);
    } catch (error) { }
  })

  ipcMain.on('join-room', (event, arg) => {
    try {
      appWindow.webContents.send('join-room', arg);
    } catch (error) { }
  })

  ipcMain.on('send-message', (event, arg) => {
    try {
      appWindow.webContents.send('send-message', arg);
    } catch (error) { }
  })

  ipcMain.on('message-sent', (event, arg) => {
    try {
      chatWindow.webContents.send('message-sent', arg);
    } catch (error) { }
  })

  ipcMain.on('get-history', (event, arg) => {
    try {
      appWindow.webContents.send('get-history', arg);
    } catch (error) { }
  })

  ipcMain.on('history', (event, arg) => {
    try {
      chatWindow.webContents.send('history', arg);
    } catch (error) { }
  })

  ipcMain.on('get-hint', (event, arg) => {
    try {
      appWindow.webContents.send('get-hint', arg);
    } catch (error) { }
  })

  ipcMain.on('option-change', (event, arg) => {
    chatWindow.webContents.send('option-change', arg);
  });

  ipcMain.on('add-priv', (event, arg) => {
    try {
      chatWindow.webContents.send('add-priv', arg);
    } catch (error) { }
  })

  appWindow.on('closed', function () {
    appWindow = null;
    app.quit();
  });

  chatWindow.on('close', (event) => {
    event.preventDefault();
    try {
      chatWindow.hide();
      appWindow.setResizable(true);
      appWindow.setSize(1550, 840);
      appWindow.setResizable(false);
      appWindow.webContents.send('simple-window');
    } catch (error) { }
  });

}

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (win === null) {
    initWindow()
  }
})
