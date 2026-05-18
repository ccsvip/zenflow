# AGENTS.md

> 本文件为本仓库提供给 AI 协作代理（Kiro / Codex / Claude 等）的统一工作守则。
> 任何代理在动手前都应先阅读本文件，并以此为最高优先级指引。

---

## 1. 沟通与思维准则

- **始终使用中文回复**。无论用户使用何种语言提问，输出（含解释、注释、提交信息）都使用中文。
- **以专业架构师与设计师思维工作**：
  - 先理解业务与既有代码，再决定方案，而不是直接堆砌代码。
  - 对每一次改动给出"为什么这样做"的简短理由，避免无脑跟随。
  - 主动识别耦合、可扩展性、可维护性、可测试性、可访问性方面的隐患。
- 回复保持克制：直接给结论与代码，避免冗长寒暄；解释长度与任务复杂度成正比。

## 2. 项目概览

- **名称**：task_flow（产品名 ZenFlow），轻量级团队项目管理工具。
- **核心模块**：登录鉴权、概览看板、项目管理、需求池、任务看板（拖拽改状态）、Bug 追踪、成员与权限管理。
- **当前形态**：单页面、内存态数据（`useState`），无后端、无持久化。所有业务逻辑集中于 `main.jsx` 的 `App` 组件。

## 3. 技术栈与约束

- **框架**：Next.js 15（App Router）
- **语言**：JavaScript + JSX（保持与源文件 `main.jsx` 一致，**不引入 TypeScript**，除非用户明确要求）
- **样式**：Tailwind CSS v3 + `tailwindcss-animate`
- **图标**：`lucide-react`
- **包管理器**：**强制使用 `pnpm`**。禁止使用 `npm install` / `yarn add`，避免锁文件冲突。
- **运行时**：Node.js ≥ 20

## 4. 目录结构

```
task_flow/
├── app/
│   ├── globals.css        # Tailwind 入口
│   ├── layout.jsx         # 根布局（lang="zh-CN"）
│   └── page.jsx           # 客户端入口，引用并挂载 main.jsx 的 App
├── main.jsx               # 业务主体（单文件巨组件，请遵守"零侵入"原则）
├── jsconfig.json          # @/* 路径别名指向项目根
├── next.config.mjs
├── tailwind.config.js     # 含动态类 safelist
├── postcss.config.mjs
├── pnpm-workspace.yaml    # pnpm v11 配置（allowBuilds）
├── package.json
└── AGENTS.md              # 本文件
```

## 5. 关键工程约定

### 5.1 关于 `main.jsx`

- `main.jsx` 是用户提供的"成品组件"，作为**事实来源**存在。
- **原则上不得修改 `main.jsx`**，除非：
  1. 用户明确要求修改其中的功能。
  2. 框架升级导致的最小必要适配（需在改动说明中明确指出）。
- 需要扩展功能时，优先选择以下顺序：
  1. 在 `app/` 下新建路由或组件来包裹 / 复用。
  2. 抽离公共逻辑到 `lib/` 或 `components/` 后再被 `main.jsx` 引用（仅在用户同意拆分时）。

### 5.2 关于 Tailwind 动态类

- `main.jsx` 中存在大量动态拼接类名（如 `bg-${color}-50`、`bg-${col.color}-500`）。
- 这些类**无法被 Tailwind 静态扫描识别**，必须在 `tailwind.config.js` 的 `safelist` 中以正则形式保留。
- 新增配色或新拼接模式时，**必须同步更新 safelist**，否则颜色会在生产构建中丢失。

### 5.3 关于客户端组件

- `main.jsx` 使用 `useState` 与浏览器 API（`window.confirm`、`alert`、`dataTransfer`），属于客户端组件。
- 任何在 App Router 下引用它的页面/组件都**必须以 `"use client"` 开头**。
- 不要尝试在服务端组件中导入它。

### 5.4 关于 pnpm v11

- 配置一律写在 `pnpm-workspace.yaml`，**不要往 `package.json` 写 `pnpm` 字段**（v11 不再读取）。
- 原 `onlyBuiltDependencies` / `ignoredBuiltDependencies` 已合并为 `allowBuilds: { name: true|false }`。
- 网络环境如遇下载缓慢，使用国内镜像：
  ```
  pnpm config set registry https://registry.npmmirror.com
  ```

## 6. 常用命令

| 目的 | 命令 |
| --- | --- |
| 安装依赖 | `pnpm install` |
| 启动开发服务器 | `pnpm dev` |
| 生产构建 | `pnpm build` |
| 启动生产服务器 | `pnpm start` |
| 代码检查 | `pnpm lint` |

> 默认开发地址：<http://localhost:3000>。默认登录账号：`root` / `123456`。

## 7. 编码规范

- **组件**：函数式组件 + Hooks；优先解构 props；状态尽量就近声明。
- **命名**：
  - 组件文件 `PascalCase.jsx`；非组件模块 `camelCase.js`。
  - 业务状态使用动词或名词短语，避免 `data1`、`tmp` 等无意义命名。
- **样式**：统一使用 Tailwind 工具类；避免引入新的 CSS 框架；必要的全局样式仅写入 `app/globals.css`。
- **可访问性**：
  - 表单控件必须有 `label` 关联或 `aria-label`。
  - 交互元素优先使用 `<button>`，避免给 `<div>` 绑 `onClick`。
  - 颜色对比度遵循 WCAG AA。
- **无障碍交互**：模态框需支持 `Esc` 关闭、聚焦陷阱（如有时间预算）。

## 8. 验证与交付

完成改动前，代理应自检：

1. `pnpm dev` 能正常启动且首页 HTTP 200。
2. 控制台无红色报错（黄色警告酌情处理）。
3. 涉及 Tailwind 类变化时，已确认在浏览器中样式生效，未被 Tree-shaking 误删。
4. `main.jsx` 未被无意修改（可用 `git diff main.jsx` 复核）。
5. 若引入新依赖，`pnpm-lock.yaml` 已提交，且依赖在 `package.json` 中固定到合理版本范围。

## 9. 安全与边界

- 严禁将密钥、个人信息、生产数据写入仓库。
- 涉及外部服务（数据库、第三方 API）时，使用环境变量并在 `.env.example` 中给出占位。
- 大范围删除、重命名、迁移等高风险操作前，必须先与用户确认。

## 10. 当用户的需求与本文件冲突时

- 用户的实时指令优先级高于本文件，但代理需要简短指出冲突点，让用户在知情下决策，再执行。
