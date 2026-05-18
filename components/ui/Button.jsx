'use client';

import { forwardRef } from 'react';
import { Spinner } from './Spinner';

/**
 * 统一的主按钮组件。
 * - variant: primary / secondary / danger / ghost / subtle
 * - size: sm / md / lg
 * - loading: 接管 disabled，并展示左侧 Spinner，避免重复点击。
 * - icon: 前置图标（建议传 lucide-react 元素）
 * - 所有 variant 都带 active:scale-[0.98] 的轻微按下反馈。
 */
const variantClass = {
  primary:
    'bg-[#0052cc] text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-300',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-300',
  subtle:
    'bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-400',
};

const sizeClass = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    icon = null,
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium',
        'transition-[background,transform,box-shadow] duration-150',
        'active:scale-[0.98] active:shadow-inner',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:active:scale-100 disabled:active:shadow-none',
        variantClass[variant],
        sizeClass[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 12 : 14} className="text-current" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});
