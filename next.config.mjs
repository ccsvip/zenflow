/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 容器化部署：生成自包含 server.js + 仅含运行期依赖的 node_modules，
  // 配合多阶段 Dockerfile 显著减小镜像体积。
  output: "standalone",
};

export default nextConfig;
