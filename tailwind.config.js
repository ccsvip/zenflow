/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./main.jsx",
  ],
  // 由于 main.jsx 中存在动态拼接的 className（如 bg-${color}-50），
  // 静态扫描无法识别，因此显式声明 safelist 以保留运行时使用的类。
  safelist: [
    // 概览卡片：item.color in ['blue', 'cyan', 'amber', 'red']
    {
      pattern: /^(bg|text)-(blue|cyan|amber|red)-(50|100|600)$/,
    },
    // 任务看板：col.color in ['slate', 'blue', 'green']
    {
      pattern: /^bg-(slate|blue|green)-500$/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
