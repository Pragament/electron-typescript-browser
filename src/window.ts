import { BrowserWindow } from "electron";
import path from "path";

export function createBrowserWindow(app: Electron.App): BrowserWindow {
  return new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, "../build/preload.js"),
    },
  });
}
