"use strict";
/* global CNKI_FASTER_DEFAULTS */

/**
 * 请求层拦截，按模块分组，与设置页开关联动：
 * - tracking 组由 blockTracking 开关控制；
 * - 其余组与同名 DOM 模块联动（模块被移除后，对应请求直接取消）。
 * 任何情况下不拦截 main_frame 文档跳转，下载链接（bar.cnki.net）不受影响。
 */
const CNKI_FASTER_RULES = [
  { group: "tracking", re: /^https?:\/\/a\.cnki\.net\/spot\//, why: "广告位" },
  { group: "tracking", re: /^https?:\/\/search\.cnki\.net\/adfiles\//, why: "广告脚本" },
  { group: "tracking", re: /^https?:\/\/support\.cnki\.net\/applog\//, why: "前端埋点" },
  { group: "tracking", re: /^https?:\/\/nxgp\.dev\.cnki\.net\//, why: "测试环境埋点" },
  { group: "tracking", re: /^https?:\/\/hm\.baidu\.com\//, why: "百度统计" },

  { group: "pageFurniture", re: /^https?:\/\/t\.cnki\.net\/webapp\/qrcode/, why: "手机二维码图" },
  { group: "pageFurniture", re: /^https?:\/\/kefu\.cnki\.net\//, why: "在线客服" },
  { group: "pageFurniture", re: /^https?:\/\/[^/]+\/openapi\/luban\//, why: "运营通知/广告" },
  { group: "pageFurniture", re: /^https?:\/\/recsys\.cnki\.net\/RCDService\/api\/Log\//, why: "推荐系统打点" },

  { group: "booksVideos", re: /^https?:\/\/book\.cnki\.net\//, why: "纸质图书推荐" },

  { group: "relatedLiterature", re: /^https?:\/\/lawpro\.cnki\.net\//, why: "相关法规数据" },
  { group: "relatedLiterature", re: /^https?:\/\/k\.cnki\.net\/kedu\//, why: "相关视频资源" },
];

let settings = Object.assign({}, CNKI_FASTER_DEFAULTS);
let blockedCount = 0;

browser.storage.local.get({ settings: CNKI_FASTER_DEFAULTS }).then((res) => {
  settings = Object.assign({}, CNKI_FASTER_DEFAULTS, res.settings || {});
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    settings = Object.assign({}, CNKI_FASTER_DEFAULTS, changes.settings.newValue || {});
  }
});

function groupEnabled(group) {
  if (group === "tracking") return !!settings.blockTracking;
  return !!settings[group];
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.type === "main_frame") return {};
    for (const rule of CNKI_FASTER_RULES) {
      if (groupEnabled(rule.group) && rule.re.test(details.url)) {
        blockedCount++;
        return { cancel: true };
      }
    }
    return {};
  },
  { urls: ["*://*.cnki.net/*", "*://*.cnki.com.cn/*", "*://hm.baidu.com/*"] },
  ["blocking"]
);

browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "cnki-faster:getStats") {
    return Promise.resolve({ blockedCount });
  }
  return undefined;
});
