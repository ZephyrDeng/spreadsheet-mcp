<!-- 添加语言切换链接 -->
[English](./README.en.md) | **中文**

# Spreadsheet MCP Server (@zephyr-mcp/spreadsheet)

一个基于 TypeScript 的模型上下文协议 (MCP) 服务器，用于通过 LLM 或 API 集成来查看、筛选、排序和更新 CSV/XLSX 电子表格文件。

## 功能特性

- 查看电子表格信息并预览行
- 按列和条件筛选行
- 按列排序行 (升序/降序)
- 向现有 XLSX 文件添加新工作表或创建新文件
- 支持 CSV 和 XLSX 文件
- 以包含二维数组的 JSON 字符串形式返回结果 (用于查看/筛选/排序)
- 技术栈：TypeScript, fastmcp, papaparse, xlsx, zod

## 安装与使用

此包设计为直接使用 `npx` 运行。典型用法无需安装。

### 先决条件

- Node.js v18+ (推荐 LTS 版本)

### 运行 MCP 服务器

在 stdio 模式下启动服务器 (用于与 Cline 等工具集成):

```bash
npx @zephyr-mcp/spreadsheet
```

服务器将启动并通过标准输入/输出监听 MCP 命令。

## 开发

### 设置

1.  克隆仓库：
    ```bash
    git clone https://github.com/your-username/spreadsheet-mcp.git # 替换为你的仓库 URL
    cd spreadsheet-mcp
    ```
2.  安装依赖：
    ```bash
    npm install
    ```

### 开发模式运行

使用 `tsx` 进行带热重载的开发：

```bash
npm run dev
```

### 构建

使用 Vite 将 TypeScript 编译为 JavaScript (输出到 `dist/`):

```bash
npm run build
```

### 测试

使用 Vitest 运行测试：

```bash
# 运行所有测试一次并生成覆盖率报告
npm test

# 在监视模式下运行测试
npm run test:watch
```

## 发布 (维护者使用)

本项目使用 [`release-it`](https://github.com/release-it/release-it) 自动化发布流程，包括版本号更新、Changelog 生成、Git 打标、npm 发布以及创建 GitHub Releases。

**发布先决条件：**

*   确保你拥有仓库的推送权限。
*   确保你拥有在 npm 上发布到 `@zephyr-mcp` scope 的权限。
*   如果在 CI 中运行发布，请在 GitHub 仓库中配置必要的 secrets (例如 `NPM_TOKEN`，如果默认 token 权限不足，可能还需要用于创建 GitHub Release 的 `PAT_TOKEN`)。

**步骤：**

1.  确保你的本地 `main` 分支是最新状态，并且工作目录是干净的。
2.  确保所有计划发布的变更都已合并到 `main` 分支。
3.  运行发布命令：
    ```bash
    npm run release
    ```
4.  `release-it` 将引导你完成整个过程：
    *   根据 Conventional Commits 确定下一个版本号。
    *   通过配置的钩子运行测试 (`npm test`) 和构建 (`npm run build`)。
    *   更新 `CHANGELOG.md`。
    *   提交变更 (`package.json`, `CHANGELOG.md`)。
    *   创建 Git 标签。
    *   将提交和标签推送到远程仓库。
    *   将包发布到 npm。
    *   创建 GitHub Release。

## 贡献

欢迎贡献！请遵循以下指南：

1.  **分支：** 为你的功能或错误修复创建一个新分支。
2.  **提交：** 遵循 [**Conventional Commits**](https://www.conventionalcommits.org/zh-hans/) 规范编写提交信息。这对 `release-it` 自动生成 Changelog 和更新版本号至关重要。
3.  **代码风格：** 保持一致的代码风格 (可以考虑添加 ESLint 等 linter)。
4.  **测试：** 为新功能或错误修复在 `tests/` 目录下添加测试。确保所有测试通过 (`npm test`)。
5.  **Pull Request:** 向 `main` 分支提交 Pull Request。

## 项目结构

```
.
├── .github/workflows/       # GitHub Actions 工作流 (CI)
│   └── ci.yml
├── dist/                    # 编译后的 JavaScript 输出 (Git 忽略)
├── node_modules/            # 依赖项 (Git 忽略)
├── src/                     # 源代码
│   ├── server.ts            # MCP 服务器入口, 工具注册
│   └── spreadsheetUtils.ts  # 电子表格解析、筛选、格式化、写入
├── tests/                   # 单元/集成测试
│   └── server.test.ts
├── .gitattributes
├── .gitignore
├── .release-it.json         # release-it 配置
├── CHANGELOG.md             # 自动生成的更新日志
├── LICENSE
├── package.json
├── README.md                # 本文档 (中文)
├── README.en.md             # 英文文档
├── tsconfig.json
└── vite.config.ts           # Vite & Vitest 配置
```

## 示例工具

- `view_spreadsheet`: 查看文件信息并预览指定行数。返回包含文件信息和预览数据（二维数组）的 JSON 字符串。`rows` 参数指定预览行数（0 表示仅表头，默认为 10，无最大限制）。
- `filter_spreadsheet`: 按列和条件筛选行。返回包含筛选结果（二维数组）的 JSON 字符串。`rows` 参数指定返回的最大行数（默认为所有匹配行，无最大限制）。
- `sort_spreadsheet`: 按列排序行。返回包含排序结果（二维数组）的 JSON 字符串。`rows` 参数指定返回的最大行数（默认为所有行，无最大限制）。
- `update_spreadsheet_with_new_sheet`: 将数据写入 XLSX 文件的新工作表

## 许可证

MIT License © 2025 Zephyr

## 作者

Zephyr