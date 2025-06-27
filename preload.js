"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
window.addEventListener("DOMContentLoaded", function () {
    var controls = document.getElementById("controls");
    var addressBar = document.getElementById("address-bar");
    var goButton = document.getElementById("go");
    var backButton = document.getElementById("back");
    var forwardButton = document.getElementById("forward");
    var refreshButton = document.getElementById("refresh");
    var homeButton = document.getElementById("home");
    var newTabButton = document.getElementById("new-tab");
    var tabsContainer = document.getElementById("tabs");
    var webviewContainer = document.getElementById("webview-container");
    var tabCount = 0;
    var activeTabId = null;
    var tabs = {};
    function getWebviewHeight() {
        var totalOffset = controls.offsetHeight + tabsContainer.offsetHeight;
        var windowHeight = window.innerHeight;
        var calculatedHeight = windowHeight - totalOffset;
        console.log("Calculated height: ".concat(calculatedHeight, "px, Window height: ").concat(windowHeight, "px, Offset: ").concat(totalOffset, "px"));
        return "".concat(calculatedHeight, "px"); // Use exact pixels instead of calc for testing
    }
    function updateWebviewHeights() {
        Object.values(tabs).forEach(function (tab) {
            tab.webview.style.height = getWebviewHeight();
            console.log("Updated ".concat(tab.id, " height to: ").concat(tab.webview.style.height));
        });
    }
    function createTab(url) {
        var tabId = "tab-".concat(++tabCount);
        var webview = document.createElement("webview");
        webview.setAttribute("src", url);
        webview.setAttribute("id", tabId);
        webview.setAttribute("allowpopups", "true");
        webview.setAttribute("autosize", "on");
        Object.assign(webview.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: getWebviewHeight(),
            border: "none",
            zIndex: "0",
            visibility: "hidden",
            pointerEvents: "none",
        });
        webviewContainer.appendChild(webview);
        var tabButton = document.createElement("button");
        tabButton.innerText = "Tab ".concat(tabCount);
        tabButton.onclick = function () { return switchToTab(tabId); };
        tabsContainer.appendChild(tabButton);
        tabs[tabId] = {
            id: tabId,
            webview: webview,
            tabElement: tabButton,
        };
        switchToTab(tabId);
    }
    function switchToTab(tabId) {
        Object.values(tabs).forEach(function (tab) {
            if (tab.id === tabId) {
                Object.assign(tab.webview.style, {
                    visibility: "visible",
                    pointerEvents: "auto",
                    zIndex: "1",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: getWebviewHeight(),
                });
                tab.tabElement.classList.add("active");
                tab.tabElement.style.fontWeight = "bold";
            }
            else {
                Object.assign(tab.webview.style, {
                    visibility: "hidden",
                    pointerEvents: "none",
                    zIndex: "0",
                    top: "-9999px",
                    left: "-9999px",
                });
                tab.tabElement.classList.remove("active");
                tab.tabElement.style.fontWeight = "normal";
            }
        });
        activeTabId = tabId;
        var currentTab = tabs[tabId];
        addressBar.value = currentTab.webview.getAttribute("src") || "";
        updateWebviewHeights();
    }
    backButton.onclick = function () {
        var _a;
        var webview = (_a = tabs[activeTabId]) === null || _a === void 0 ? void 0 : _a.webview;
        if (webview === null || webview === void 0 ? void 0 : webview.canGoBack())
            webview.goBack();
    };
    forwardButton.onclick = function () {
        var _a;
        var webview = (_a = tabs[activeTabId]) === null || _a === void 0 ? void 0 : _a.webview;
        if (webview === null || webview === void 0 ? void 0 : webview.canGoForward())
            webview.goForward();
    };
    refreshButton.onclick = function () {
        var _a;
        var webview = (_a = tabs[activeTabId]) === null || _a === void 0 ? void 0 : _a.webview;
        webview === null || webview === void 0 ? void 0 : webview.reload();
    };
    homeButton.onclick = function () {
        var _a;
        var webview = (_a = tabs[activeTabId]) === null || _a === void 0 ? void 0 : _a.webview;
        webview === null || webview === void 0 ? void 0 : webview.loadURL("https://github.com");
    };
    goButton.onclick = function () {
        var _a;
        var url = addressBar.value.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }
        var webview = (_a = tabs[activeTabId]) === null || _a === void 0 ? void 0 : _a.webview;
        webview === null || webview === void 0 ? void 0 : webview.loadURL(url);
    };
    newTabButton.onclick = function () {
        console.log("➕ Add Tab Clicked");
        createTab("https://www.w3schools.com");
    };
    window.addEventListener("resize", function () {
        var _a;
        updateWebviewHeights();
        var activeWebview = (_a = tabs[activeTabId]) === null || _a === void 0 ? void 0 : _a.webview;
        if (activeWebview)
            activeWebview.reload(); // Force refresh on resize
    });
    // Create default tab at start
    window.onload = function () {
        createTab("https://github.com");
    };
});
