# 更新日志

本文件记录每个发布版本的改动。格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循语义化版本。

## Unreleased

（暂无待发布条目）

## 0.2.0 - 2026-10-10

- 跨浏览器支持：单一 MV3 代码库适配 Firefox、Chrome、Edge；background 双键
  声明（service_worker 与 scripts）各端取所需；请求拦截从阻塞式 webRequest
  改为 declarativeNetRequest 声明式规则，规则生成抽为可测试的纯函数模块
- 仓库治理：MIT License、CHANGELOG、CONTRIBUTING、SECURITY、README 重写，
  删除早期 Python 脚手架，补仓库描述与 topics
- CI 与发布流水线：lint 与 test 两个 job（对齐分支保护 required checks），
  tag 触发自动打包 GitHub Release（zip 与 SHA256SUMS）
- 隐私：声明 data_collection_permissions 为 none，扩展不收集任何数据

## 0.1.0 - 2026-10-10

- 初版：知网文献页按模块精简（右侧推荐栏、核心文献推荐、引文网络、相关文献推荐、
  图书与视频推荐、广告与页面装饰），页面脚本初始化前移除节点
- 请求层拦截：广告位脚本、前端埋点、图书推荐、二维码、客服等请求
- 设置面板：每个模块可单独开关，修改即保存
- 逃生舱：文献页带 cnki-faster=off 参数重载时扩展不做任何干预
- CARSI 代理适配：国防科大图书馆代理（域名倒序路径格式）页面同样生效，
  规则逻辑与学校无关，新增代理域名即可推广
