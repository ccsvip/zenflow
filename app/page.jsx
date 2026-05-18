"use client";

import App from "@/main.jsx";
import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";

export default function Page() {
  // Toast 在外层、Confirm 在内层：Confirm 弹窗内点击"删除"后调用 toast.success
  // 时仍可访问到 ToastContext。
  return (
    <ToastProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ToastProvider>
  );
}
