# Changelog

本项目的所有显著变更都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## v0.2.0 (2026-10-10)

### Added

- **跨浏览器支持，一套 MV3 代码适配 Firefox、Chrome、Edge**：Chrome 与 Edge 已停用 MV2 且 MV3 下禁用阻塞式 webRequest，manifest 升 MV3 后 background 双键声明（service_worker 供 Chrome 与 Edge，scripts 供 Firefox 事件页），各端只取自己认识的键。三端用全局命名空间别名替代 polyfill，用到的 API（storage、tabs、declarativeNetRequest）在三端 MV3 下都原生返回 Promise。（PR #3）
- **规则测试固化为持续集成用例**：`tests/rules.test.mjs` 把此前手工验证过的 28 个 URL 用例（直连与 CARSI 代理双形态、下载直链与主文档放行）落成 node:test 断言，另覆盖规则结构的 RE2 兼容性与设置开关的规则生成。知网或代理改版后跑测试即可定位失效规则。（PR #3）
- **CI 与发布流水线**：ci.yml 提供 lint（JS 语法、manifest 校验、web-ext lint）与 test 两个 job，job 名与 main 分支保护的 required checks 一一对齐，最小权限、取消同引用旧跑。release.yml 在 tag 触发时复跑检查后打包 `cnki-faster-<版本>.zip` 与 SHA256SUMS.txt 并创建 GitHub Release，产物 manifest 在压缩包根目录，三端与商店提交通用。（PR #4、#5）

### Changed

- **请求拦截从阻塞式 webRequest 改为 declarativeNetRequest 声明式规则**：MV3 下 webRequestBlocking 不可用，原先 onBeforeRequest 里逐条正则匹配的写法无法移植，改为 `rules.js` 纯函数生成声明式规则。每条同时匹配直连与 CARSI 域名倒序两种形态，正则转 RE2 兼容写法并按完整 URL 匹配语义补尾，设置变更时全删全建动态规则。主文档跳转与下载直链始终放行，行为与 v0.1.0 一致。（PR #3）
- **仓库治理补齐**：新增 MIT License、CONTRIBUTING、SECURITY，README 重写并补徽章与三浏览器安装说明，删除早期 uv Python 脚手架，仓库定位收敛为纯浏览器扩展项目，仓库描述与 topics 已设置。（PR #2）
- **隐私声明显式化**：manifest 声明 `data_collection_permissions: ["none"]`，与扩展不收集任何数据的实际行为一致，这也是 Mozilla 对新提交扩展的要求。popup 的请求计数改显示已启用模块数，DNR 声明式拦截没有逐请求回调可供计数。（PR #3）

## v0.1.0 (2026-10-10)

### Added

- **知网文献页按模块精简**：content script 在 document_start 注入默认隐藏样式并用 MutationObserver 在知网页面脚本初始化前移除被禁模块节点，引文网络、相关文献等 AJAX 请求根本不发出，比加载完成后再隐藏显著提速。七个模块（右侧推荐栏、核心文献推荐、引文网络、相关文献推荐、图书视频推荐、广告与页面装饰、广告与统计请求）默认全拦，设置面板逐项可关。
- **请求层拦截与下载保护**：广告位脚本（`a.cnki.net/spot`）、前端埋点（`support.cnki.net/applog`）、图书推荐、二维码、客服等请求在后台取消。下载直链（`bar.cnki.net/bar/download/order`）与登录、检索、主文档跳转始终放行。
- **逃生舱**：文献页 URL 带 `cnki-faster=off` 参数重载时扩展不做任何干预，页面右下角小浮条提供 PDF 下载、查看完整页与设置入口。
- **CARSI 代理适配**：高校图书馆代理（如国防科大 `libyc.nudt.edu.cn`）把知网域名按段倒写进路径，拦截规则为每条同时生成直连与倒序两种正则，逻辑与具体学校无关，新增代理域名即可推广到其他学校。（PR #1）
