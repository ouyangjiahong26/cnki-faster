"use strict";
/* global CNKI_FASTER_DEFAULTS, CNKI_FASTER_RULES, buildDnrRules */

// Chromium 系（Chrome、Edge）的 MV3 service worker 用 importScripts 加载依赖；
// Firefox 的 MV3 事件页通过 manifest 的 background.scripts 加载，这里不重复。
if (typeof importScripts === "function") {
  importScripts("config.js", "rules.js");
}

// 本扩展用到的 API（storage、declarativeNetRequest）在三端 MV3 下都返回
// Promise，Chrome 系只有 chrome 命名空间，一行别名即可，无需引入 polyfill。
const browser = globalThis.browser ?? globalThis.chrome;

// 设置到 declarativeNetRequest 动态规则的同步：全删全建。规则只有二十余条，
// 动态规则上限为一千条，无压力。下载直链（bar.cnki.net）与主文档不在规则中，
// 始终放行。
async function rebuildRules() {
  const stored = await browser.storage.local.get({ settings: CNKI_FASTER_DEFAULTS });
  const settings = Object.assign({}, CNKI_FASTER_DEFAULTS, stored.settings || {});
  const existing = await browser.declarativeNetRequest.getDynamicRules();
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: buildDnrRules(settings),
  });
}

browser.runtime.onInstalled.addListener(rebuildRules);
browser.runtime.onStartup.addListener(rebuildRules);
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    rebuildRules();
  }
});

// 动态规则本身跨浏览器重启持久，这里在事件页唤醒时再同步一次，保持与设置一致
rebuildRules().catch((e) => console.warn("cnki-faster: 重建规则失败", e));
