"use strict";

/**
 * 请求拦截规则（纯数据与纯函数，无浏览器 API 依赖），供后台与测试共用。
 *
 * 每条规则同时匹配两种 URL 形态：
 *   直连      https://a.cnki.net/spot/...
 *   CARSI 代理 https://libyc.nudt.edu.cn/https/443/net/cnki/a/spot/...
 *             （代理把目标域名按段倒写：a.cnki.net 对应 net/cnki/a）
 *
 * buildDnrRules 把正则转成 declarativeNetRequest 动态规则：
 * - regexFilter 用 RE2 兼容写法（无回头引用、无环视），并补 ".*" 尾巴，
 *   因为 DNR 要求正则匹配完整 URL；
 * - resourceTypes 覆盖 Firefox 与 Chromium 都支持的子资源类型，
 *   不含 main_frame，主文档跳转永远放行。
 */
(function (root) {
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

  // 组名与设置键的映射：tracking 组的开关叫 blockTracking，其余组名即键名
  const GROUP_SETTING = { tracking: "blockTracking" };

  function groupSettingKey(group) {
    return GROUP_SETTING[group] || group;
  }

  const RESOURCE_TYPES = [
    "sub_frame",
    "stylesheet",
    "script",
    "image",
    "font",
    "object",
    "xmlhttprequest",
    "ping",
    "media",
    "websocket",
    "other",
  ];

  function buildDnrRules(settings) {
    return CNKI_FASTER_RULES
      .filter((r) => settings[groupSettingKey(r.group)])
      .map((r, i) => ({
        id: i + 1,
        priority: 1,
        condition: {
          regexFilter: r.re.source + ".*",
          resourceTypes: RESOURCE_TYPES.slice(),
        },
        action: { type: "block" },
      }));
  }

  const api = { CNKI_FASTER_RULES, buildDnrRules, groupSettingKey, RESOURCE_TYPES };
  root.CNKI_FASTER_RULES = CNKI_FASTER_RULES;
  root.buildDnrRules = buildDnrRules;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
