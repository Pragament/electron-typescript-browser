"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.ipcMain.handle("print", async (event, arg) => {
    const win = new electron_1.BrowserWindow({ show: false });
    await win.loadURL(arg);
    win.webContents.print({}, (success, failureReason) => {
        if (!success)
            console.error(failureReason);
        win.close();
    });
});
