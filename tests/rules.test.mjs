import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  CNKI_FASTER_RULES,
  buildDnrRules,
  groupSettingKey,
  RESOURCE_TYPES,
} = require("../extension/rules.js");

const ALL_ON = {
  rightSidebar: true,
  coreLiterature: true,
  citationNetwork: true,
  relatedLiterature: true,
  booksVideos: true,
  pageFurniture: true,
  blockTracking: true,
};

// 直连与 CARSI 代理形态都应拦截；下载直链、主文档、非知网页面放行
const URL_CASES = [
  ["https://a.cnki.net/spot/x.js", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/a/spot/x.js", true],
  ["https://support.cnki.net/applog/front?x=1", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/support/applog/front?x=1", true],
  ["https://hm.baidu.com/hm.js?x", true],
  ["https://libyc.nudt.edu.cn/https/443/com/baidu/hm/hm.js?x", true],
  ["https://kns.cnki.net/openapi/luban/v1/notifications/latest", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/kns/openapi/luban/v1/notifications/latest", true],
  ["https://t.cnki.net/webapp/qrcode?x", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/t/webapp/qrcode?x", true],
  ["https://recsys.cnki.net/RCDService/api/Log/UserHitLog?x", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/recsys/RCDService/api/Log/UserHitLog?x", true],
  ["https://book.cnki.net/book?id=1", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/book/book?id=1", true],
  ["https://k.cnki.net/kedu/pub/resource/KNS", true],
  ["https://lawpro.cnki.net/inds/dispage?x", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/lawpro/inds/dispage?x", true],
  ["https://nxgp.dev.cnki.net/applog/front", true],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/dev/nxgp/applog/front", true],
  // 不应拦截：
  ["https://bar.cnki.net/bar/download/order?id=Pmp%2F5es3", false],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/bar/download/order?id=Pmp%2F5es3", false],
  ["https://kns.cnki.net/kcms2/article/abstract?v=1RpLqATIpQzt", false],
  [
    "https://libyc.nudt.edu.cn/https/443/net/cnki/kns/yitlink/kcms2/article/abstract?v=1RpLqATIpQyd&uniplatform=NZKPT",
    false,
  ],
  ["https://login.cnki.net/login?returnUrl=x", false],
  ["https://libyc.nudt.edu.cn/", false],
  ["https://libyc.nudt.edu.cn/https/443/net/cnki/kns8s/defaultresult/index", false],
  ["https://kns.cnki.net/restapi/knavi-api/xxx", false],
];

// DNR 的 regexFilter 按完整 URL 匹配（RE2 全匹配语义），用 ^(...)$ 包一层模拟
function dnrMatch(regexFilter, url) {
  return new RegExp("^(?:" + regexFilter + ")$").test(url);
}

test("正则规则：直连与 CARSI 代理双形态判定正确", () => {
  for (const [url, want] of URL_CASES) {
    const got = CNKI_FASTER_RULES.some((r) => r.re.test(url));
    assert.equal(got, want, url);
  }
});

test("DNR 规则：regexFilter 完整匹配语义下判定与正则一致", () => {
  const rules = buildDnrRules(ALL_ON);
  assert.ok(rules.length > 0);
  for (const [url, want] of URL_CASES) {
    const got = rules.some((r) => dnrMatch(r.condition.regexFilter, url));
    assert.equal(got, want, url);
  }
});

test("DNR 规则：结构与 RE2 兼容性", () => {
  const rules = buildDnrRules(ALL_ON);
  const ids = rules.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "规则 id 必须唯一");
  for (const r of rules) {
    assert.equal(r.priority, 1);
    assert.equal(r.action.type, "block");
    assert.ok(r.condition.regexFilter.startsWith("^"), "regexFilter 应锚定开头");
    assert.ok(r.condition.regexFilter.endsWith(".*"), "regexFilter 应以 .* 覆盖完整 URL");
    assert.ok(!r.condition.regexFilter.includes("(?<"), "RE2 不支持环视");
    assert.deepEqual(r.condition.resourceTypes, RESOURCE_TYPES);
    assert.ok(!r.condition.resourceTypes.includes("main_frame"), "主文档必须放行");
  }
});

test("设置开关：关闭模块后对应规则不生成", () => {
  const disabled = new Set(["tracking", "booksVideos"]);
  const expected = CNKI_FASTER_RULES.filter((r) => !disabled.has(r.group)).length;
  const rules = buildDnrRules({ ...ALL_ON, blockTracking: false, booksVideos: false });
  assert.equal(rules.length, expected);
  for (const r of rules) {
    const source = r.condition.regexFilter;
    assert.ok(!source.includes("baidu"), "tracking 关闭后不应有百度统计规则");
    assert.ok(!source.includes("book"), "booksVideos 关闭后不应有图书推荐规则");
  }
});

test("组名与设置键映射", () => {
  assert.equal(groupSettingKey("tracking"), "blockTracking");
  assert.equal(groupSettingKey("pageFurniture"), "pageFurniture");
  assert.equal(groupSettingKey("relatedLiterature"), "relatedLiterature");
});
