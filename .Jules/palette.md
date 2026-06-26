## 2026-06-26 - [Add Async Form Feedback to Login]
**Learning:** Implementing consistent loading states and explicitly disabling inputs during async operations (like login) is crucial for UX. Without it, users may repeatedly click submit or get confused by the lack of immediate feedback.
**Action:** Use `loading={state}` for submit buttons and apply `disabled:opacity-60 disabled:cursor-not-allowed` to related form inputs.
