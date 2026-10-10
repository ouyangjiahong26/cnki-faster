"use strict";

/**
 * CNKI Faster 共享配置。
 * content script / background / 设置弹窗三方共用，改这里即可增删拦截模块。
 */

// 每个模块的默认开关
const CNKI_FASTER_DEFAULTS = {
  rightSidebar: true,       // 右侧推荐栏：AI 推荐问题、服务推荐、纸质图书广告
  coreLiterature: true,     // 核心文献推荐（研究起点/终点图谱，请求量大）
  citationNetwork: true,    // 引文网络（参考文献/引证文献/共引图谱）
  relatedLiterature: true,  // 相关文献推荐（相似文献、读者推荐、关联作者……）
  booksVideos: true,        // 图书推荐与相关视频
  pageFurniture: true,      // 广告与页面装饰：页脚、客服悬浮条、二维码、AI 阅读按钮
  blockTracking: true,      // 请求层：拦截广告位与前端埋点（独立于 DOM 模块）
};

// DOM 模块：key 对应上面的开关（blockTracking 除外，它只管请求）
const CNKI_FASTER_MODULES = [
  {
    key: "rightSidebar",
    label: "右侧推荐栏",
    desc: "AI 推荐问题、服务推荐、纸质图书广告、会员广告",
    selectors: ["#right_part_ai", "#Ecp_members_operate"],
  },
  {
    key: "coreLiterature",
    label: "核心文献推荐",
    desc: "研究起点/研究终点图谱，会发起大量数据请求",
    selectors: ["#kcms-data-quoted-corefirerecomend"],
  },
  {
    key: "citationNetwork",
    label: "引文网络",
    desc: "参考文献、引证文献、共引/共被引图谱",
    selectors: ["#refpartdiv"],
  },
  {
    key: "relatedLiterature",
    label: "相关文献推荐",
    desc: "相似文献、读者推荐、相关基金文献、关联作者、相关法规",
    selectors: ["#literature-recommend"],
  },
  {
    key: "booksVideos",
    label: "图书推荐与相关视频",
    desc: "纸质书广告位、电子书推荐、相关视频",
    selectors: [
      "#relBooks",
      "#book-recommend",
      "#kcms-data-ebook",
      "#dz-carousel",
      "#video-content",
    ],
  },
  {
    key: "pageFurniture",
    label: "广告与页面装饰",
    desc: "页脚、在线咨询/用户反馈悬浮条、手机二维码、CNKI AI 阅读按钮、运营广告位",
    selectors: [
      "#ModuleFooter",
      "#ModuleToolbar",
      "#slider-container",
      "[id^='recommend1']",
      "[class*='qrcode']",
      "[id*='qrcode']",
      ".btn-cnki-ai",
      "#cnkiAiReader",
      ".btn-recommend",
      ".btn-grcg",
    ],
  },
];

// 逃生舱 URL 参数：文献页加载时带上 cnki-faster=off 则本次不做任何精简
const CNKI_FASTER_OFF_PARAM = "cnki-faster";
