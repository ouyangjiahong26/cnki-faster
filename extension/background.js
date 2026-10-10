"use strict";
/* global CNKI_FASTER_DEFAULTS */

/**
 * 请求层拦截，按模块分组，与设置页开关联动：
 * - tracking 组由 blockTracking 开关控制；
 * - 其余组与同名 DOM 模块联动（模块被移除后，对应请求直接取消）。
 * 任何情况下不拦截 main_frame 文档跳转，下载链接（bar.cnki.net）不受影响。
 *
 * 每条规则同时匹配两种 URL 形态：
 *   直连      https://a.cnki.net/spot/...
 *   CARSI 代理 https://libyc.nudt.edu.cn/https/443/net/cnki/a/spot/...
 *             （代理把目标域名按段倒写：a.cnki.net -> net/cnki/a）
 */
const PROXIED_PREFIX = "^https?://[^/]+/(?:https?/)?(?:\\d+/)?";
const revHost = (h) => h.split(".").reverse().join("/");

function hostRule(group, why, host, path) {
  const hostPat = host.replace(/\./g, "\\.");
  return [
    { group, why, re: new RegExp("^https?://" + hostPat + path) },
    { group, why, re: new RegExp(PROXIED_PREFIX + revHost(host) + path) },
  ];
}

// 不限定子域名的路径规则（直连任意 *.cnki.net / *.cnki.com.cn）
function cnkiRule(group, why, path) {
  return [
    { group, why, re: new RegExp("^https?://[a-z0-9.-]*cnki\\.(?:net|com\\.cn)" + path) },
    { group, why, re: new RegExp(PROXIED_PREFIX + "(?:net/cnki|cn/com/cnki)/(?:[^/]+/)*" + path.slice(1)) },
  ];
}

const CNKI_FASTER_RULES = [].concat(
  hostRule("tracking", "广告位", "a.cnki.net", "/spot/"),
  hostRule("tracking", "广告脚本", "search.cnki.net", "/adfiles/"),
  hostRule("tracking", "前端埋点", "support.cnki.net", "/applog/"),
  hostRule("tracking", "测试环境埋点", "nxgp.dev.cnki.net", "/"),
  hostRule("tracking", "百度统计", "hm.baidu.com", "/"),

  hostRule("pageFurniture", "手机二维码图", "t.cnki.net", "/webapp/qrcode"),
  hostRule("pageFurniture", "在线客服", "kefu.cnki.net", "/"),
  cnkiRule("pageFurniture", "运营通知/广告", "/openapi/luban/"),
  hostRule("pageFurniture", "推荐系统打点", "recsys.cnki.net", "/RCDService/api/Log/"),

  hostRule("booksVideos", "纸质图书推荐", "book.cnki.net", "/"),

  hostRule("relatedLiterature", "相关法规数据", "lawpro.cnki.net", "/"),
  hostRule("relatedLiterature", "相关视频资源", "k.cnki.net", "/kedu/")
);

const FILTER_URLS = [
  "*://*.cnki.net/*",
  "*://*.cnki.com.cn/*",
  "*://*.nudt.edu.cn/*",
  "*://hm.baidu.com/*",
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
  { urls: FILTER_URLS },
  ["blocking"]
);

browser.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "cnki-faster:getStats") {
    return Promise.resolve({ blockedCount });
  }
  return undefined;
});
