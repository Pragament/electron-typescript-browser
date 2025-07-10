"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrowserWindow = createBrowserWindow;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
function createBrowserWindow(app) {
    return new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true,
            preload: path_1.default.join(__dirname, "../build/preload.js"),
        },
    });
}
