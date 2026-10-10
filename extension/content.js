"use strict";
/* global CNKI_FASTER_DEFAULTS, CNKI_FASTER_MODULES, CNKI_FASTER_OFF_PARAM */

(() => {
  // 逃生舱：URL 带 cnki-faster=off 时本次不做任何精简
  if (new URLSearchParams(location.search).get(CNKI_FASTER_OFF_PARAM) === "off") {
    return;
  }

  // 只处理知网页面：直连 *.cnki.net/*.cnki.com.cn，或 CARSI 代理（如 libyc.nudt.edu.cn）
  // 上路径被改写成 /net/cnki/... 的页面；科大图书馆门户等其他页面直接跳过。
  const isDirectCnki = /(^|\.)cnki\.(net|com\.cn)$/.test(location.hostname);
  if (!isDirectCnki && !CNKI_FASTER_PROXY_PATH.test(location.pathname)) {
    return;
  }

  let settings = Object.assign({}, CNKI_FASTER_DEFAULTS);
  let settingsReady = false;
  let finished = false;

  // 1) 同步注入样式：默认配置下零闪烁，真实设置毫秒级到达后替换
  const styleEl = document.createElement("style");
  styleEl.id = "cnki-faster-style";
  document.documentElement.appendChild(styleEl);

  function hideCss() {
    const rules = [];
    for (const mod of CNKI_FASTER_MODULES) {
      if (!settings[mod.key]) continue;
      rules.push(mod.selectors.join(",") + "{display:none!important}");
    }
    return rules.join("\n");
  }

  const CHIP_CSS = [
    "#cnki-faster-bar{position:fixed!important;right:18px!important;bottom:18px!important;",
    "z-index:2147483000!important;display:flex!important;gap:4px!important;padding:6px!important;",
    "border-radius:8px!important;background:#1a66e0!important;box-shadow:0 2px 10px rgba(0,0,0,.25)!important;",
    "font:13px/1 'Microsoft YaHei',sans-serif!important}",
    "#cnki-faster-bar button{all:unset!important;cursor:pointer!important;color:#fff!important;",
    "padding:6px 10px!important;border-radius:6px!important;font:13px/1 'Microsoft YaHei',sans-serif!important}",
    "#cnki-faster-bar button:hover{background:rgba(255,255,255,.22)!important}",
    "#cnki-faster-bar button.primary{background:#fff!important;color:#1a66e0!important;font-weight:700!important}",
  ].join("\n");

  function applyStyles() {
    styleEl.textContent = CHIP_CSS + "\n" + hideCss();
  }
  applyStyles(); // 先按默认配置隐藏，避免闪烁

  // 2) DOM 清除：在页面脚本初始化前移除被禁模块的节点，相关 AJAX 自然不再发起
  function sweep() {
    if (!settingsReady) return;
    for (const mod of CNKI_FASTER_MODULES) {
      if (!settings[mod.key]) continue;
      for (const sel of mod.selectors) {
        for (const el of document.querySelectorAll(sel)) {
          el.remove();
        }
      }
    }
  }

  const observer = new MutationObserver(sweep);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  browser.storage.local.get({ settings: CNKI_FASTER_DEFAULTS }).then((res) => {
    settings = Object.assign({}, CNKI_FASTER_DEFAULTS, res.settings || {});
    settingsReady = true;
    applyStyles();
    sweep();
  });

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.settings) {
      settings = Object.assign({}, CNKI_FASTER_DEFAULTS, changes.settings.newValue || {});
      applyStyles();
      sweep();
    }
  });

  // 3) 页面就绪后：注入右下角小浮条（仅文献详情页）
  function buildChip() {
    if (document.getElementById("cnki-faster-bar")) return;
    const hasDownload = document.getElementById("pdfDown") || document.getElementById("cajDown");
    if (!hasDownload) return;

    const bar = document.createElement("div");
    bar.id = "cnki-faster-bar";

    const pdf = document.createElement("button");
    pdf.className = "primary";
    pdf.textContent = "PDF 下载";
    pdf.title = "调用页面自带的 PDF 下载";
    pdf.addEventListener("click", () => {
      const a = document.getElementById("pdfDown");
      if (a) a.click();
    });
    bar.appendChild(pdf);

    const full = document.createElement("button");
    full.textContent = "完整页";
    full.title = "重新加载不做精简的完整页面";
    full.addEventListener("click", () => {
      const url = new URL(location.href);
      url.searchParams.set(CNKI_FASTER_OFF_PARAM, "off");
      location.href = url.href;
    });
    bar.appendChild(full);

    const cfg = document.createElement("button");
    cfg.textContent = "设置";
    cfg.title = "打开拦截设置";
    cfg.addEventListener("click", () => browser.runtime.openOptionsPage());
    bar.appendChild(cfg);

    (document.body || document.documentElement).appendChild(bar);

    browser.runtime
      .sendMessage({ type: "cnki-faster:getStats" })
      .then((res) => {
        if (res && res.blockedCount > 0) {
          bar.title = "本次会话已拦截 " + res.blockedCount + " 个无关请求";
        }
      })
      .catch(() => {});
  }

  function finish() {
    sweep();
    if (document.readyState === "loading") return;
    if (finished) return;
    finished = true;
    observer.disconnect();
    buildChip();
    // 兜底：部分组件由页面脚本延迟注入
    setTimeout(() => {
      sweep();
      buildChip();
    }, 1500);
  }

  document.addEventListener("DOMContentLoaded", finish);
  window.addEventListener("load", finish);
  setTimeout(finish, 3000); // 双保险：页面长时间未加载完也能完成清理
})();
