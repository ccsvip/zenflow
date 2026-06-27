## 2025-01-20 - [Login Form Loading State]
**Learning:** Adding explicit loading states and disabling inputs during async operations (like login) prevents users from clicking multiple times and being confused by no immediate feedback. In this app, setting button `loading` prop and using Tailwind `disabled:opacity-60 disabled:cursor-not-allowed` on inputs gives clear visual cues.
**Action:** Always implement disabled states on forms while waiting for async submissions, particularly for auth flows.
