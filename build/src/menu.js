"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplate = void 0;
const createTemplate = (name) => {
    const template = [
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { role: "pasteAndMatchStyle" },
                { role: "delete" },
                { role: "selectAll" }
            ]
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { type: "separator" },
                { role: "togglefullscreen" }
            ]
        },
        {
            role: "window",
            submenu: [
                { role: "minimize" },
                { role: "close" }
            ]
        }
    ];
    if (process.platform === "darwin") {
        template.unshift({
            label: name,
            submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "services", submenu: [] },
                { type: "separator" },
                { role: "hide" },
                { role: "hideOthers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" }
            ]
        });
        // Add Speech to Edit menu (macOS)
        const editMenu = template.find(item => item.label === "Edit");
        if (editMenu?.submenu && Array.isArray(editMenu.submenu)) {
            editMenu.submenu.push({ type: "separator" }, {
                label: "Speech",
                submenu: [
                    { role: "startSpeaking" },
                    { role: "stopSpeaking" }
                ]
            });
        }
        // Override Window menu (macOS)
        const windowMenu = template.find(item => item.role === "window");
        if (windowMenu) {
            windowMenu.submenu = [
                { role: "close" },
                { role: "minimize" },
                { role: "zoom" },
                { type: "separator" },
                { role: "front" }
            ];
        }
    }
    return template;
};
exports.createTemplate = createTemplate;
