import "./globals.css";

export const metadata = {
  title: "ZenFlow - 团队项目管理",
  description: "轻量级团队项目管理工具",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
