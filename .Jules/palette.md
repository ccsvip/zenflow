## 2024-05-24 - 统一登录表单的异步加载反馈模式
**Learning:** In scenarios involving asynchronous network requests, simple button disabling or a standalone spinner is insufficient. A lack of comprehensive interaction constraints may lead users to attempt to modify fields during submission. Furthermore, an absent disabled visual cue on inputs could confuse users as to why the form is unresponsive to edits during submission.
**Action:** When implementing async form submissions, establish a consistent UX pattern:
1. Pass a boolean loading state to the submission `<Button>`'s `loading` prop (which manages its own disabled state and spinner).
2. Explicitly pass the same loading state to all interactive input fields (e.g., `<input disabled={loading}>`).
3. Apply standard Tailwind "disabled" pseudo-classes to inputs to clearly indicate non-interactivity (e.g., `disabled:opacity-60 disabled:cursor-not-allowed`).