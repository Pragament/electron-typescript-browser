import { app, Menu, BrowserWindow } from "electron";

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
  const window = require("./src/window");
  mainWindow = window.createBrowserWindow(app);

  mainWindow.loadFile("index.html");

  const menu = require("./src/menu");
  const template = menu.createTemplate(app.name);
  const builtMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(builtMenu);

  require("./src/print");

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.executeJavaScript(`
      document.getElementById('controls').style.display = 'flex';
      document.getElementById('tabs').style.display = 'flex';
      console.log('Window size:', window.innerWidth, window.innerHeight);
    `);
  });

  // Toggle full-screen on F11
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      console.log('Full-screen toggled:', mainWindow.isFullScreen());
      mainWindow.webContents.executeJavaScript('window.dispatchEvent(new Event("resize"));'); // Trigger resize
      event.preventDefault();
    }
  });

  // Log resize events
  mainWindow.on('resize', () => {
    console.log('Window resized:', mainWindow.getSize());
    mainWindow.webContents.executeJavaScript('window.dispatchEvent(new Event("resize"));');
  });
});

app.on("window-all-closed", () => {
  app.quit();
});