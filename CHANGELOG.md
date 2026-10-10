# 更新日志

本文件记录每个发布版本的改动。格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循语义化版本。

## Unreleased

计划中：

- 跨浏览器支持：单一 MV3 代码库适配 Firefox、Chrome、Edge，请求拦截改为
  declarativeNetRequest 声明式规则
- CI 与发布流水线：lint、测试、tag 触发自动打包 GitHub Release
- 商店上架物料与操作清单（AMO、Chrome Web Store、Edge Add-ons）

## 0.1.0 - 2026-10-10

- 初版：知网文献页按模块精简（右侧推荐栏、核心文献推荐、引文网络、相关文献推荐、
  图书与视频推荐、广告与页面装饰），页面脚本初始化前移除节点
- 请求层拦截：广告位脚本、前端埋点、图书推荐、二维码、客服等请求
- 设置面板：每个模块可单独开关，修改即保存
- 逃生舱：文献页带 cnki-faster=off 参数重载时扩展不做任何干预
- CARSI 代理适配：国防科大图书馆代理（域名倒序路径格式）页面同样生效，
  规则逻辑与学校无关，新增代理域名即可推广
