"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
window.addEventListener("DOMContentLoaded", () => {
    const controls = document.getElementById("controls");
    const addressBar = document.getElementById("address-bar");
    const goButton = document.getElementById("go");
    const backButton = document.getElementById("back");
    const forwardButton = document.getElementById("forward");
    const refreshButton = document.getElementById("refresh");
    const homeButton = document.getElementById("home");
    const newTabButton = document.getElementById("new-tab");
    const tabsBar = document.getElementById("tabs");
    const webviewContainer = document.getElementById("webview-container");
    const recordToggleButton = document.getElementById("record-toggle");
    const settingsModal = document.getElementById("settings-modal");
    const settingsClose = document.getElementById("settings-close");
    const settingsForm = document.getElementById("settings-form");
    const timelapseIntervalInput = document.getElementById("timelapse-interval");
    const downloadPathInput = document.getElementById("download-path");
    const chooseDownloadPathButton = document.getElementById("choose-download-path");
    let activeTabId = null;
    const tabs = [];
    let mediaRecorder = null;
    let recordedChunks = [];
    let timelapseInterval = null;
    let isRecording = false;
    function applyWebviewContent(webview) {
        webview.classList.add("active");
        Object.assign(webview.style, {
            visibility: "visible",
            pointerEvents: "auto",
            zIndex: "1"
        });
        webview.executeJavaScript(`
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.height = '100%';
      document.documentElement.style.height = '100%';
      window.dispatchEvent(new Event('resize'));
    `);
    }
    function setActiveTab(tabId) {
        tabs.forEach(tab => {
            const isActive = tab.id === tabId;
            tab.tabElement.classList.toggle("active", isActive);
            tab.tabElement.style.fontWeight = isActive ? "bold" : "normal";
            if (isActive) {
                tab.webview.classList.add("active");
                activeTabId = tab.id;
                addressBar.value = tab.webview.getAttribute("src") || "";
                applyWebviewContent(tab.webview);
            }
            else {
                tab.webview.classList.remove("active");
            }
        });
    }
    function addNewTab(url = "https://github.com") {
        const tabId = `tab-${Date.now()}`;
        const tabButton = document.createElement("button");
        tabButton.textContent = `Tab ${tabs.length + 1}`;
        tabButton.dataset.tabId = tabId;
        const webview = document.createElement("webview");
        webview.setAttribute("src", url);
        webview.setAttribute("partition", `persist:${tabId}`);
        webview.classList.add("webview");
        webview.dataset.tabId = tabId;
        Object.assign(webview.style, {
            visibility: "hidden",
            pointerEvents: "none",
            zIndex: "0"
        });
        webviewContainer.appendChild(webview);
        const newTab = { id: tabId, webview, tabElement: tabButton };
        tabs.push(newTab);
        tabsBar.appendChild(tabButton);
        tabButton.addEventListener("click", () => setActiveTab(tabId));
        webview.addEventListener("did-finish-load", () => {
            if (activeTabId === tabId)
                applyWebviewContent(webview);
        });
        webview.addEventListener("did-navigate", (e) => {
            if (activeTabId === tabId)
                addressBar.value = e.url;
        });
        setActiveTab(tabId);
    }
    settingsClose.addEventListener("click", () => {
        settingsModal.style.display = "none";
    });
    window.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = "none";
        }
    });
    async function startRecording() {
        const dirPath = downloadPathInput.value.trim();
        if (!dirPath || /^[A-Z]:\\$/i.test(dirPath)) {
            alert("❌ Invalid directory. Choose a subfolder.");
            return;
        }
        const sources = await electron_1.ipcRenderer.invoke("get-screen-sources");
        const source = sources[0];
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: source.id,
                },
            },
        });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0)
                recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const buffer = Buffer.from(await blob.arrayBuffer());
            await electron_1.ipcRenderer.invoke("save-recording", { buffer, downloadPath: dirPath });
            recordToggleButton.textContent = "Start Recording";
            isRecording = false;
            clearInterval(timelapseInterval);
        };
        mediaRecorder.start();
        recordToggleButton.textContent = "Stop Recording";
        isRecording = true;
        const interval = parseInt(timelapseIntervalInput.value) || 1;
        timelapseInterval = setInterval(() => {
            if (mediaRecorder?.state === "recording") {
                mediaRecorder.requestData();
            }
        }, interval * 1000);
    }
    function stopRecording() {
        if (mediaRecorder?.state === "recording") {
            mediaRecorder.stop();
        }
    }
    recordToggleButton.onclick = () => {
        if (isRecording) {
            stopRecording();
        }
        else {
            startRecording();
        }
    };
    document.getElementById("settings-button").addEventListener("click", () => {
        settingsModal.style.display = "block";
    });
    settingsClose.addEventListener("click", () => {
        settingsModal.style.display = "none";
    });
    window.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = "none";
        }
    });
    chooseDownloadPathButton.onclick = async () => {
        const result = await electron_1.ipcRenderer.invoke("open-directory-dialog");
        if (result.filePaths?.length > 0) {
            downloadPathInput.value = result.filePaths[0];
        }
    };
    backButton.onclick = () => {
        const wv = tabs.find(t => t.id === activeTabId)?.webview;
        if (wv?.canGoBack())
            wv.goBack();
    };
    forwardButton.onclick = () => {
        const wv = tabs.find(t => t.id === activeTabId)?.webview;
        if (wv?.canGoForward())
            wv.goForward();
    };
    refreshButton.onclick = () => {
        const wv = tabs.find(t => t.id === activeTabId)?.webview;
        wv?.reload();
    };
    homeButton.onclick = () => {
        const wv = tabs.find(t => t.id === activeTabId)?.webview;
        wv?.loadURL("https://github.com");
    };
    goButton.onclick = () => {
        let url = addressBar.value.trim();
        if (!/^https?:\/\//i.test(url))
            url = "https://" + url;
        const wv = tabs.find(t => t.id === activeTabId)?.webview;
        wv?.loadURL(url);
    };
});
