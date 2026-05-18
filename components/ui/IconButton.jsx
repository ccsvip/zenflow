'use client';

import { forwardRef } from 'react';

/**
 * 仅包含图标的按钮，强制要求 aria-label，并自动渲染 Tooltip。
 * - tone: default / danger，用于 hover 着色。
 * - 不使用外部 Tooltip 组件以避免嵌套 group，直接用本地 group 上下文。
 */
const toneClass = {
  default: 'text-slate-400 hover:text-blue-600 hover:bg-blue-50',
  danger: 'text-slate-400 hover:text-red-600 hover:bg-red-50',
  white: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
};

export const IconButton = forwardRef(function IconButton(
  {
    label,
    tone = 'default',
    children,
    className = '',
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <span className="relative inline-flex group/iconbtn">
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={[
          'inline-flex h-7 w-7 items-center justify-center rounded transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
          'active:scale-95',
          toneClass[tone],
          className,
        ].join(' ')}
        {...rest}
      >
        {children}
      </button>
      {label && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/iconbtn:opacity-100 group-focus-within/iconbtn:opacity-100"
        >
          {label}
        </span>
      )}
    </span>
  );
});
