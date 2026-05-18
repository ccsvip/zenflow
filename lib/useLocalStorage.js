'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 用 localStorage 做轻量级持久化的 React Hook。
 *
 * 设计要点：
 * - 首次渲染始终返回 `initialValue`，避免 SSR/CSR hydration 不一致。
 * - 挂载后再异步从 localStorage 读取实际值，触发一次重渲染。
 * - 写入做了 try/catch，浏览器隐私模式或配额超限时不会让应用崩溃。
 * - 仅做简单 JSON 序列化，仅适合内存级 demo 数据；敏感字段（如密码）
 *   按照本仓库 demo 的既有约束写入，但生产环境必须改用接口与加密。
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  // 用于跳过"挂载后从存储读到值"那一帧的回写，避免重复写入。
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) {
        setValue(JSON.parse(raw));
      }
    } catch (err) {
      // 静默失败，使用 initialValue 兜底。
      console.warn(`[useLocalStorage] 读取 ${key} 失败：`, err);
    } finally {
      hydratedRef.current = true;
    }
    // 仅在挂载时读取一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[useLocalStorage] 写入 ${key} 失败：`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
