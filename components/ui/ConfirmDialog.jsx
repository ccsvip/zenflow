'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * 命令式 confirm 替代品。
 * 通过 Provider 注入到树顶，组件内 `const confirm = useConfirm()`，
 * 然后 `const ok = await confirm({...})` 即可，避免到处声明 isOpen 状态。
 *
 * tone:
 * - danger 用红色主按钮，对应删除等破坏性操作；
 * - default 用蓝色主按钮。
 */
const ConfirmContext = createContext(null);

const defaultOptions = {
  title: '请确认',
  description: '',
  confirmText: '确定',
  cancelText: '取消',
  tone: 'default', // default | danger
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, options: defaultOptions });
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        open: true,
        options: { ...defaultOptions, ...options },
      });
    });
  }, []);

  const close = useCallback((result) => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const value = useMemo(() => confirm, [confirm]);
  const { open, options } = state;
  const isDanger = options.tone === 'danger';

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={open}
        onClose={() => close(false)}
        title={options.title}
        size="sm"
        headerTone={isDanger ? 'danger' : 'normal'}
        headerIcon={
          isDanger ? <AlertTriangle size={18} className="text-red-500" /> : null
        }
      >
        <div className="p-6">
          {options.description && (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {options.description}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="secondary" onClick={() => close(false)}>
              {options.cancelText}
            </Button>
            <Button
              variant={isDanger ? 'danger' : 'primary'}
              onClick={() => close(true)}
              autoFocus
            >
              {options.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm 必须在 <ConfirmProvider> 内使用');
  }
  return ctx;
}
