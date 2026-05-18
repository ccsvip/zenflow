/**
 * 通用字段级校验工具。
 * 校验函数返回 string（错误信息）或 null（通过）。
 */

export const required = (value, label = '该字段') => {
  if (value == null || String(value).trim() === '') {
    return `${label}不能为空`;
  }
  return null;
};

export const minLength = (value, n, label = '该字段') => {
  if (value && String(value).length < n) {
    return `${label}至少 ${n} 个字符`;
  }
  return null;
};

export const sameAs = (a, b, label = '两次输入') => {
  if (a !== b) return `${label}不一致`;
  return null;
};

/**
 * 把多个校验函数串起来，遇到第一个错误就返回。
 */
export const compose = (...checks) => {
  for (const check of checks) {
    const err = check();
    if (err) return err;
  }
  return null;
};
