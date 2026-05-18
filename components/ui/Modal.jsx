'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * 通用模态框，统一替换 main.jsx 中重复的 fixed inset-0 模板。
 *
 * 关注点：
 * - Esc 关闭：document 级 keydown 监听，按下时调用 onClose。
 * - 焦点陷阱：Tab/Shift+Tab 在容器内循环，避免焦点泄漏到背景。
 * - 打开时锁定 body 滚动，关闭时恢复。
 * - 点击遮罩关闭，点击对话框本体不会冒泡触发关闭。
 * - 头部 padding/底色由 headerTone 控制（normal / danger）。
 */
const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const headerToneClass = {
  normal: 'bg-slate-50 text-slate-800',
  danger: 'bg-red-50 text-red-800',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
  headerTone = 'normal',
  headerIcon = null,
  closeOnOverlay = true,
}) {
  const containerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Esc 关闭 + 焦点陷阱
  useEffect(() => {
    if (!open) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusables = containerRef.current.querySelectorAll(FOCUSABLE);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !containerRef.current.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // 打开时尝试聚焦第一个可聚焦元素，关闭时归还焦点
  useEffect(() => {
    if (!open) return undefined;
    const node = containerRef.current;
    if (!node) return undefined;
    const focusables = node.querySelectorAll(FOCUSABLE);
    const target = focusables[0] || node;
    // 等待动画下一帧再聚焦，避免被 Chrome 自动滚动打断
    const t = window.setTimeout(() => target.focus({ preventScroll: true }), 0);
    return () => {
      window.clearTimeout(t);
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === 'function') {
        prev.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // 锁定 body 滚动
  useEffect(() => {
    if (!open) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClass[size]} overflow-hidden animate-in zoom-in-95 fade-in duration-150 outline-none`}
      >
        {(title || onClose) && (
          <div
            className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${headerToneClass[headerTone]}`}
          >
            <h3 className="font-bold flex items-center gap-2">
              {headerIcon}
              {title}
            </h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="text-slate-400 hover:text-slate-600 transition-colors rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
