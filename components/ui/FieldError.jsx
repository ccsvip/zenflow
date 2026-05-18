'use client';

/**
 * 表单字段错误提示，与 input/select 配合使用。
 * 把 `id` 关联到对应输入控件的 aria-describedby 即可获得无障碍支持。
 */
export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-xs text-red-500 leading-relaxed"
    >
      {message}
    </p>
  );
}
