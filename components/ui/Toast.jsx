'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * 轻量级 Toast 系统：
 * - 通过 ToastProvider 提供 useToast() 命令式 API：toast.success / error / info。
 * - 右上角堆叠，自动消失（默认 2500ms），可手动关闭。
 * - 使用 role="status" + aria-live="polite"，不打断屏幕阅读器当前朗读。
 */
const ToastContext = createContext(null);

const variantStyle = {
  success: {
    icon: <CheckCircle2 size={18} className="text-emerald-500" />,
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: <AlertCircle size={18} className="text-red-500" />,
    border: 'border-red-200',
    bar: 'bg-red-500',
  },
  info: {
    icon: <Info size={18} className="text-blue-500" />,
    border: 'border-blue-200',
    bar: 'bg-blue-500',
  },
};

let idCounter = 0;
const nextId = () => {
  idCounter += 1;
  return `toast-${Date.now()}-${idCounter}`;
};

export function ToastProvider({ children, max = 4 }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (variant, message, opts = {}) => {
      const id = nextId();
      const duration = opts.duration ?? 2500;
      setToasts((list) => {
        const next = [...list, { id, variant, message }];
        // 控制堆叠数，超过则丢掉最早一条
        return next.length > max ? next.slice(next.length - max) : next;
      });
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss, max],
  );

  // 卸载时清理所有定时器，防止内存泄漏。
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const api = useMemo(
    () => ({
      success: (msg, opts) => show('success', msg, opts),
      error: (msg, opts) => show('error', msg, opts),
      info: (msg, opts) => show('info', msg, opts),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)]"
      >
        {toasts.map((t) => {
          const style = variantStyle[t.variant] || variantStyle.info;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 min-w-[260px] max-w-sm bg-white border ${style.border} shadow-lg rounded-lg pl-4 pr-2 py-3 text-sm text-slate-700 animate-in slide-in-from-right-5 fade-in duration-200 relative overflow-hidden`}
            >
              <span
                className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`}
                aria-hidden
              />
              <span className="mt-0.5">{style.icon}</span>
              <span className="flex-1 leading-relaxed whitespace-pre-line">
                {t.message}
              </span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="关闭通知"
                className="text-slate-400 hover:text-slate-600 rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast 必须在 <ToastProvider> 内使用');
  }
  return ctx;
}
