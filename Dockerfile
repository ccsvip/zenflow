# ============ 阶段 1：安装依赖 ============
FROM node:20-alpine AS deps
WORKDIR /app

# 启用 corepack 以使用项目锁文件对应的 pnpm（lockfile v9 ⇒ pnpm 9+）
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# 仅拷贝依赖描述文件，最大化利用层缓存
# 注意：不拷贝 pnpm-workspace.yaml —— pnpm v11 会把它视为 monorepo 配置并要求
# 顶层 packages 字段，而本仓库仅借助该文件配置 allowBuilds（容器构建期不需要）。
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ============ 阶段 2：构建 ============
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 关闭 Next telemetry，避免构建期网络请求
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ============ 阶段 3：运行 ============
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 非 root 运行，提升安全性
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Next.js standalone 输出：仅拷贝运行所需文件
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 当前项目无 public/ 目录，如未来新增静态资源再恢复以下行：
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# 端口、Hostname 由运行时环境变量提供（compose 注入），此处只声明默认值
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
