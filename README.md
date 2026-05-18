# ZenFlow（task_flow）

轻量级团队项目管理工具，支持项目、需求、任务、Bug 全流程管理。

## 功能特性

- **项目管理**：创建和管理多个项目，支持项目状态跟踪（规划中、进行中、暂停、已完成）
- **需求池**：管理产品需求，支持需求状态流转（草稿、激活、开发中、已测、已发布、关闭）
- **任务看板**：Kanban 风格的任务管理，支持拖拽切换任务状态（待办、进行中、已完成、已归档）
- **Bug 追踪**：记录和跟踪缺陷，支持优先级和严重程度分级
- **用户权限**：多用户支持，管理员可创建和管理团队成员账户
- **数据持久化**：基于 localStorage 的本地数据持久化（开发版）

## 技术栈

- **框架**：Next.js 15（App Router）
- **语言**：JavaScript + JSX
- **样式**：Tailwind CSS v3 + `tailwindcss-animate`
- **图标**：lucide-react
- **包管理器**：pnpm v11
- **运行时**：Node.js ≥ 20

## 本地开发

### 环境要求

- Node.js ≥ 20
- pnpm（推荐使用 [corepack](https://pnpm.io/installation#using-corepack) 安装）

### 启动步骤

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

**默认登录账号**：`root` / `123456`

### 其他命令

| 命令 | 说明 |
| --- | --- |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 代码检查 |

## Docker 部署

### 环境变量

复制 `.env.example` 到 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

主要配置项：

- `WEB_PORT=3000`：浏览器访问端口
- `DB_PORT=5432`：PostgreSQL 数据库端口
- `DB_NAME=zenflow`：数据库名称
- `DB_USER=zenflow`：数据库用户名
- `DB_PASSWORD=zenflow123`：数据库密码

### 启动服务

```bash
# 构建并启动容器
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

访问 http://localhost:3000（端口以 `.env` 中配置为准）

## 项目结构

```
task_flow/
├── app/                    # Next.js App Router 页面
│   ├── globals.css        # Tailwind CSS 入口
│   ├── layout.jsx         # 根布局
│   └── page.jsx           # 客户端入口
├── main.jsx               # 业务主体（单文件组件）
├── components/            # React 组件
│   └── ui/                # UI 基础组件
├── lib/                   # 工具函数库
├── .kiro/                 # Kiro 协作配置
├── package.json
├── next.config.mjs
├── tailwind.config.js
├── docker-compose.yaml
└── Dockerfile
```

## 开发规范

- **组件命名**：`PascalCase.jsx`
- **工具函数**：`camelCase.js`
- **状态命名**：语义化命名，避免 `data1`、`tmp` 等无意义名称
- **样式**：统一使用 Tailwind 工具类
- **可访问性**：表单控件必须有 `label` 关联或 `aria-label`

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT