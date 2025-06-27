import type { WebviewTag } from 'electron';

interface Tab {
  id: string;
  webview: WebviewTag;
  tabElement: HTMLButtonElement;
}

window.addEventListener("DOMContentLoaded", () => {
  const controls = document.getElementById("controls")!;
  const addressBar = document.getElementById("address-bar") as HTMLInputElement;
  const goButton = document.getElementById("go")!;
  const backButton = document.getElementById("back")!;
  const forwardButton = document.getElementById("forward")!;
  const refreshButton = document.getElementById("refresh")!;
  const homeButton = document.getElementById("home")!;
  const newTabButton = document.getElementById("new-tab")!;
  const tabsContainer = document.getElementById("tabs")!;
  const webviewContainer = document.getElementById("webview-container")!;

  let tabCount = 0;
  let activeTabId: string | null = null;
  const tabs: { [key: string]: Tab } = {};

  function getWebviewHeight(): string {
    const totalOffset = controls.offsetHeight + tabsContainer.offsetHeight;
    const windowHeight = window.innerHeight;
    const calculatedHeight = windowHeight - totalOffset;
    console.log(`Calculated height: ${calculatedHeight}px, Window height: ${windowHeight}px, Offset: ${totalOffset}px`);
    return `${calculatedHeight}px`; // Use exact pixels instead of calc for testing
  }

  function updateWebviewHeights() {
    Object.values(tabs).forEach((tab) => {
      tab.webview.style.height = getWebviewHeight();
      console.log(`Updated ${tab.id} height to: ${tab.webview.style.height}`);
    });
  }

  function createTab(url: string) {
    const tabId = `tab-${++tabCount}`;

    const webview = document.createElement("webview") as WebviewTag;
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

    const tabButton = document.createElement("button");
    tabButton.innerText = `Tab ${tabCount}`;
    tabButton.onclick = () => switchToTab(tabId);
    tabsContainer.appendChild(tabButton);

    tabs[tabId] = {
      id: tabId,
      webview,
      tabElement: tabButton,
    };

    switchToTab(tabId);
  }

  function switchToTab(tabId: string) {
    Object.values(tabs).forEach((tab) => {
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
      } else {
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
    const currentTab = tabs[tabId];
    addressBar.value = currentTab.webview.getAttribute("src") || "";
    updateWebviewHeights();
  }

  backButton.onclick = () => {
    const webview = tabs[activeTabId!]?.webview;
    if (webview?.canGoBack()) webview.goBack();
  };

  forwardButton.onclick = () => {
    const webview = tabs[activeTabId!]?.webview;
    if (webview?.canGoForward()) webview.goForward();
  };

  refreshButton.onclick = () => {
    const webview = tabs[activeTabId!]?.webview;
    webview?.reload();
  };

  homeButton.onclick = () => {
    const webview = tabs[activeTabId!]?.webview;
    webview?.loadURL("https://github.com");
  };

  goButton.onclick = () => {
    let url = addressBar.value.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    const webview = tabs[activeTabId!]?.webview;
    webview?.loadURL(url);
  };

  newTabButton.onclick = () => {
    console.log("➕ Add Tab Clicked");
    createTab("https://www.w3schools.com");
  };

  window.addEventListener("resize", () => {
    updateWebviewHeights();
    const activeWebview = tabs[activeTabId!]?.webview;
    if (activeWebview) activeWebview.reload(); // Force refresh on resize
  });

  // Create default tab at start
  window.onload = () => {
    createTab("https://github.com");
  };
});