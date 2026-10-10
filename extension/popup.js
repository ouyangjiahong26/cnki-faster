"use strict";
/* global CNKI_FASTER_DEFAULTS, CNKI_FASTER_MODULES */

const list = document.getElementById("module-list");

// blockTracking 是纯请求层开关，没有对应 DOM，单独追加
const ITEMS = CNKI_FASTER_MODULES.map((m) => ({ key: m.key, label: m.label, desc: m.desc })).concat([
  {
    key: "blockTracking",
    label: "拦截广告与统计请求",
    desc: "广告位脚本、前端埋点、推荐系统打点（不删页面内容，仅取消网络请求）",
  },
]);

browser.storage.local.get({ settings: CNKI_FASTER_DEFAULTS }).then((res) => {
  const settings = Object.assign({}, CNKI_FASTER_DEFAULTS, res.settings || {});
  for (const item of ITEMS) {
    const li = document.createElement("li");

    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = !!settings[item.key];
    box.addEventListener("change", () => {
      settings[item.key] = box.checked;
      browser.storage.local.set({ settings });
    });
    label.appendChild(box);

    const text = document.createElement("span");
    text.textContent = item.label;
    label.appendChild(text);

    const desc = document.createElement("p");
    desc.className = "desc";
    desc.textContent = item.desc;

    li.appendChild(label);
    li.appendChild(desc);
    list.appendChild(li);
  }
});

document.getElementById("reload-cnki").addEventListener("click", () => {
  browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (tab && /^https?:\/\/([^/]+\.)?cnki\.(net|com\.cn)\//.test(tab.url || "")) {
      browser.tabs.reload(tab.id);
    }
  });
  window.close();
});
