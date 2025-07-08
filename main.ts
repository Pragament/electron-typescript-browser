import { app, Menu, BrowserWindow, ipcMain, dialog, session, desktopCapturer } from "electron";
import * as fs from "fs";
import * as path from "path";

let mainWindow: BrowserWindow;

app.whenReady().then(() => {
  console.log("Creating main window...");

  // Resolve the preload script path
  const preloadPath = path.join(__dirname, "../build/preload.js");
  console.log("Preload path:", preloadPath);

  // Create the main window
  mainWindow = new BrowserWindow({
    fullscreen: true,
    show: false, // show later after ready-to-show
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
    },
  });

  console.log("WebPreferences configured:", {
    preload: preloadPath,
    nodeIntegration: false,
    contextIsolation: true,
    webviewTag: true,
  });

  // Load HTML
  mainWindow.loadFile("index.html").then(() => {
    console.log("Main window HTML loaded");
  }).catch((err) => {
    console.error("Failed to load HTML:", err);
  });

  // Handle preload failure
  mainWindow.webContents.on("did-fail-load", () => {
    console.error("Failed to load preload script at:", preloadPath);
  });

  // Enable screen/media permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log("Permission requested:", permission);
    if (permission === "media" || permission === "display-capture") {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Set application menu
  const menu = require("./src/menu");
  const template = menu.createTemplate(app.name);
  const builtMenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(builtMenu);

  // Load print support
  require("./src/print");

  // Show window once ready
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.executeJavaScript(`
      window.addEventListener('load', () => {
        const controls = document.getElementById('controls');
        const tabs = document.getElementById('tabs');
        const webviewContainer = document.getElementById('webview-container');
        if (controls && tabs && webviewContainer) {
          controls.style.display = 'flex';
          tabs.style.display = 'flex';
          const controlsHeight = controls.offsetHeight || 0;
          const tabsHeight = tabs.offsetHeight || 0;
          webviewContainer.style.height = \`calc(100vh - \${controlsHeight + tabsHeight}px)\`;
          console.log('Window size:', window.innerWidth, window.innerHeight);
        } else {
          console.error('DOM elements not found during initial setup');
        }
      });
    `).then(() => {
      console.log("Initial UI setup completed");
    }).catch((err) => {
      console.error("Initial UI setup failed:", err.message);
    });
  });

  // F11 for full-screen toggle
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F11" && input.type === "keyDown") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      console.log("Full-screen toggled:", mainWindow.isFullScreen(), "Size:", mainWindow.getSize());
      mainWindow.webContents.executeJavaScript(`
        window.addEventListener('load', () => {
          const controls = document.getElementById('controls');
          const tabs = document.getElementById('tabs');
          const webviewContainer = document.getElementById('webview-container');
          if (controls && tabs && webviewContainer) {
            const controlsHeight = controls.offsetHeight || 0;
            const tabsHeight = tabs.offsetHeight || 0;
            webviewContainer.style.height = \`calc(100vh - \${controlsHeight + tabsHeight}px)\`;
            window.dispatchEvent(new Event('resize'));
          } else {
            console.error('DOM elements not found during F11 toggle');
          }
        }, { once: true });
      `).catch((err) => {
        console.error("F11 toggle script failed:", err.message);
      });
      event.preventDefault();
    }
  });

  // Resize handler to adjust webview height
  mainWindow.on("resize", () => {
    console.log("Window resized:", mainWindow.getSize());
    mainWindow.webContents.executeJavaScript(`
      window.addEventListener('load', () => {
        const controls = document.getElementById('controls');
        const tabs = document.getElementById('tabs');
        const webviewContainer = document.getElementById('webview-container');
        if (controls && tabs && webviewContainer) {
          const controlsHeight = controls.offsetHeight || 0;
          const tabsHeight = tabs.offsetHeight || 0;
          webviewContainer.style.height = \`calc(100vh - \${controlsHeight + tabsHeight}px)\`;
          window.dispatchEvent(new Event('resize'));
        } else {
          console.error('DOM elements not found during resize');
        }
      }, { once: true });
    `).catch((err) => {
      console.error("Resize script failed:", err.message);
    });
  });

  // Handle recording save
  ipcMain.handle("save-recording", async (event, { buffer, downloadPath }) => {
    console.log("Saving recording...", downloadPath);
    const fileName = `recording_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    const defaultPath = app.getPath("downloads");
    const tempPath = app.getPath("temp");

    let finalPath = path.join(downloadPath || defaultPath, fileName);
    const dir = path.dirname(finalPath);

    console.log("Checking directory:", dir);
    try {
      if (!fs.existsSync(dir)) {
        console.warn(`Directory ${dir} does not exist. Creating...`);
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(finalPath, buffer);
      console.log(`✅ Recording saved to: ${finalPath}`);
    } catch (err) {
      console.error("❌ Failed to save to original path, trying temp path...", err);
      try {
        finalPath = path.join(tempPath, fileName);
        fs.writeFileSync(finalPath, buffer);
        console.log(`✅ Saved to fallback temp path: ${finalPath}`);
      } catch (fallbackErr) {
        console.error("❌ Fallback save also failed:", fallbackErr);
        throw fallbackErr;
      }
    }
  });

  // Handle open folder dialog
  ipcMain.handle("open-directory-dialog", async () => {
    console.log("Opening directory dialog...");
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });
    return result;
  });

  // Get screen sources for screen recording
  ipcMain.handle("get-screen-sources", async () => {
    console.log("Fetching screen sources...");
    const sources = await desktopCapturer.getSources({ types: ["screen"] });
    return sources;
  });
});

app.on("window-all-closed", () => {
  app.quit();
});