'use client';

/**
 * 通用加载圆环，用纯 SVG + Tailwind animate-spin。
 * 不引入额外依赖。
 */
export function Spinner({ size = 16, className = '' }) {
  return (
    <svg
      role="status"
      aria-label="加载中"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`animate-spin ${className}`}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
