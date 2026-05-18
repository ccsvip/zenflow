'use client';

/**
 * 极简纯 CSS Tooltip：用 group-hover 触发。
 * - 适合非关键信息的辅助说明，例如图标按钮的语义。
 * - 不做精确碰撞检测，固定显示在元素正上方。
 * - 给容器加 `group` 由调用方自行决定（通常 IconButton 包了 group）。
 */
export function Tooltip({ label, children, side = 'top', className = '' }) {
  if (!label) return children;

  const sideClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }[side];

  return (
    <span className={`relative inline-flex group ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${sideClass}`}
      >
        {label}
      </span>
    </span>
  );
}
