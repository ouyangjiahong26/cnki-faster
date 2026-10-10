# CNKI Faster 知网精简加速

[![CI](https://github.com/ouyangjiahong26/cnki-faster/actions/workflows/ci.yml/badge.svg)](https://github.com/ouyangjiahong26/cnki-faster/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/ouyangjiahong26/cnki-faster)](https://github.com/ouyangjiahong26/cnki-faster/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个浏览器扩展：打开知网文献页（知网节）时，只保留文献基本信息和 PDF、CAJ 下载，
在页面脚本初始化之前移除 AI 推荐、核心文献推荐、引文网络、相关文献推荐、图书视频
广告等模块，并从网络层拦截对应的请求，从而明显加快加载速度。同一套代码适配
Firefox、Chrome、Edge。

选择器与拦截规则基于 2026-10 的知网文献页（`kns.cnki.net/kcms2/article/abstract`）
真实结构编写，搜索列表页不做改动。

## 功能

- DOM 精简（默认全开，可逐项关闭）：
  - 右侧推荐栏：AI 推荐问题、服务推荐、纸质图书广告
  - 核心文献推荐（研究起点与终点图谱，数据请求量大）
  - 引文网络（参考文献、引证文献、共引图谱）
  - 相关文献推荐（相似文献、读者推荐、关联作者等）
  - 图书推荐与相关视频
  - 广告与页面装饰：页脚、客服悬浮条、二维码、CNKI AI 阅读按钮等
- 请求拦截：取消广告位脚本（`a.cnki.net/spot`）、前端埋点
  （`support.cnki.net/applog`）、图书推荐（`book.cnki.net`）、二维码图、客服等请求；
  下载链接（`bar.cnki.net/bar/download/order`）和登录、检索功能不受影响。
- CARSI 代理适配：通过高校图书馆代理（如国防科大
  `libyc.nudt.edu.cn/https/443/net/cnki/kns/...`）访问的知网页面同样生效。代理把
  目标域名按段倒写进路径（`a.cnki.net` 对应 `/net/cnki/a/`），请求拦截规则同时
  匹配直连与倒序两种形态。适配其他学校：把该校代理域名按 `manifest.json` 中
  `nudt.edu.cn` 的写法（permissions、content_scripts.matches）追加即可，页面识别
  与请求匹配逻辑本身是通用的。
- 设置面板：每个模块可单独开关，修改即保存，刷新知网页面后生效。
- 逃生舱：文献页右下角小浮条的「完整页」以 `cnki-faster=off` 参数重载，本次不做
  任何干预；「PDF 下载」按钮直接调用页面自带的 PDF 下载。

## 安装

### 从商店安装

上架后回填链接（提交审核中）：

- Firefox（AMO）：待上架
- Chrome Web Store：待上架
- Edge Add-ons：待上架

### 从 Release 手动安装

从 [Releases](https://github.com/ouyangjiahong26/cnki-faster/releases) 下载对应
zip 并解压，然后：

- Firefox：地址栏输入 `about:debugging#/runtime/this-firefox`，「临时载入附加
  组件」，选择解压目录内的 `manifest.json`。未签名扩展重启 Firefox 后需重新载入，
  常驻安装请从 AMO 安装。
- Chrome：地址栏输入 `chrome://extensions`，打开右上角「开发者模式」，「加载已
  解压的扩展程序」，选择解压目录。
- Edge：地址栏输入 `edge://extensions`，打开左侧「开发人员模式」，「加载解压缩
  的扩展」，选择解压目录。

## 设置

三种入口：工具栏扩展图标的弹出面板、文献页右下角小浮条的「设置」按钮、浏览器
扩展管理页的「选项」。每个拦截模块单独开关，修改立即保存。

## 工作原理

- 内容脚本在 `document_start` 注入：先按默认配置隐藏目标模块避免闪烁，读取设置
  后在页面脚本初始化前把被禁模块的节点整个移除，知网自己的脚本发现容器不存在，
  引文网络、相关文献等 AJAX 请求就不会发出。
- 后台用 declarativeNetRequest 声明式规则在请求层取消广告与埋点请求，设置变更时
  重建规则。
- 下载直链、主文档跳转、登录与检索始终放行。

## 目录结构

```
extension/            扩展源码
├── manifest.json     MV3 清单
├── config.js         模块定义（选择器、开关、默认值）
├── rules.js          请求拦截规则生成（纯函数，可测试）
├── background.js     后台：声明式规则管理
├── content.js        内容脚本：DOM 精简与右下角小浮条
└── popup.*           设置面板
tests/                规则与选择器的 node 测试
scripts/check.sh      本地检查入口（语法、manifest、lint、测试）
docs/                 仓库协作文档
```

## 开发

```bash
scripts/check.sh        # 语法校验、manifest 校验、web-ext lint、测试
```

浏览器内调试：`web-ext run -s extension`（Firefox），或按上文手动安装方式加载
`extension/` 目录。

## 维护

知网改版会导致选择器失效，更新方法：

1. 在文献页 Ctrl+S 保存完整网页；
2. 从保存的 HTML 中找到失效模块的容器 id 或 class；
3. 更新 `extension/config.js` 的 `CNKI_FASTER_MODULES`（DOM 模块）或
   `extension/rules.js`（请求拦截），补充测试用例后提交 PR。

## 许可证

[MIT](LICENSE)
