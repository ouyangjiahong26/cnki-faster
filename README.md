# CNKI Faster 知网精简加速

一个 Firefox 扩展：打开知网文献页（知网节）时，**只保留文献基本信息和 PDF/CAJ 下载**，
把 AI 推荐、核心文献推荐、引文网络、相关文献推荐、图书/视频广告等内容在页面脚本初始化之前
移除，并从网络层拦截对应的请求，从而明显加快加载速度。

选择器与拦截规则基于 2026-10 的知网文献页（`kns.cnki.net/kcms2/article/abstract`）真实
结构编写，搜索列表页不做改动。

## 功能

- **DOM 精简**（默认全开，可逐项关闭）：
  - 右侧推荐栏：AI 推荐问题、服务推荐、纸质图书广告
  - 核心文献推荐（研究起点/终点图谱，数据请求量大）
  - 引文网络（参考文献/引证文献/共引图谱）
  - 相关文献推荐（相似文献、读者推荐、关联作者等）
  - 图书推荐与相关视频
  - 广告与页面装饰：页脚、客服悬浮条、二维码、CNKI AI 阅读按钮等
- **请求拦截**：取消广告位脚本（`a.cnki.net/spot`）、前端埋点
  （`support.cnki.net/applog`）、图书推荐（`book.cnki.net`）、二维码图、客服等请求；
  下载链接（`bar.cnki.net/bar/download/order`）和登录、检索功能不受影响。
- **设置**：点击工具栏图标弹出设置面板，每个模块可单独开关；也可在文献页右下角小浮条点
  「设置」。修改立即保存，刷新知网页面后生效。
- **逃生舱**：文献页右下角小浮条 →「完整页」，本次以 `?cnki-faster=off` 参数重新加载，
  扩展不做任何干预；PDF 按钮则直接调用页面自带的 PDF 下载。

## 安装（Firefox 临时加载）

1. 打开 Firefox，地址栏输入 `about:debugging#/runtime/this-firefox`
2. 点击「临时载入附加组件…」
3. 选择本仓库的 `extension/manifest.json`
4. 打开任一知网文献页即可看到效果；右下角会出现「PDF 下载 / 完整页 / 设置」小浮条

> 临时载入在 Firefox 重启后失效，需重新载入。日常使用可在 `extension/` 目录运行
> `web-ext run` 开发调试，或打包 zip 后通过 [addons.mozilla.org](https://addons.mozilla.org/developers/)
> 自行签名（AMO 未签名扩展无法常驻安装）。

## 目录结构

```
extension/
├── manifest.json   # MV2 清单：权限、background、content_scripts
├── config.js       # 模块定义（选择器、开关、默认值），增删拦截模块改这里
├── background.js   # webRequest 按模块拦截请求 + 拦截计数
├── content.js      # document_start 注入样式、提前移除模块节点、右下角小浮条
├── popup.html/.js/.css  # 设置面板
```

## 维护

知网改版会导致选择器失效。更新方法：在文献页 `Ctrl+S` 保存完整网页，从保存的 HTML 中找
到目标模块的容器 `id`/`class`，更新 `extension/config.js` 的 `CNKI_FASTER_MODULES`；
网络请求拦截规则在 `extension/background.js` 的 `CNKI_FASTER_RULES` 中按组维护。
