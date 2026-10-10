# 贡献指南

感谢关注 cnki-faster。欢迎通过 issue 与 pull request 参与贡献。

## 报告问题

- 知网页面改版导致拦截失效：请附上文献页 URL 与「保存完整网页」得到的 HTML 片段
  （含目标模块的容器 id），说明期望的行为。
- 功能建议与浏览器兼容问题：先搜索已有 issue，没有再开新 issue。

## 提交改动

1. 从最新的 `main` 切出功能分支，分支名 `<type>/<slug>`，例如
   `fix/citation-network-selector`。
2. 提交信息用类 Conventional Commits 格式，描述用中文，例如
   `fix(extension): 修正引文网络容器选择器`。
3. 提交前本地跑 `scripts/check.sh`（语法校验、manifest 校验、lint 与测试）。
4. PR 描述写清改动内容与验证方式。选择器相关的改动请附验证过的页面 URL。

## 开发约定

- 仓库编码与写作标准见 [AGENTS.md](AGENTS.md)。
- 知网页面结构的容器 id 与拦截端点集中在 `extension/config.js` 与
  `extension/rules.js`，改版后只更新这两处，具体方法见 README 的「维护」一节。
