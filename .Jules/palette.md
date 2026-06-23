## 2024-06-24 - Login Form Loading State
**Learning:** Adding explicit loading states and disabling form inputs during async operations (like login) provides crucial visual feedback and prevents duplicate submissions.
**Action:** Implement the standard `loading={isLoading}` prop on submit buttons and apply `disabled:opacity-60 disabled:cursor-not-allowed` to form inputs for all async form submissions.
