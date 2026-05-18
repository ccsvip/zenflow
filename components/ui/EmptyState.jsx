'use client';

/**
 * 通用空态：图标 + 主文案 + 可选副文案 + 可选 CTA。
 * 使用方在 list 长度为 0 时渲染本组件。
 */
export function EmptyState({
  icon = null,
  title,
  description = '',
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
