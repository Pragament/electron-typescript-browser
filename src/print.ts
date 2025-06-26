import { ipcMain, BrowserWindow } from "electron";

ipcMain.handle("print", async (event: Electron.IpcMainInvokeEvent, arg: string) => {
  const win = new BrowserWindow({ show: false });
  await win.loadURL(arg);
  win.webContents.print({}, (success, failureReason) => {
    if (!success) console.error(failureReason);
    win.close();
  });
});
