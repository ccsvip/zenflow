## 2024-05-19 - Consistent Loading States for Async Forms
**Learning:** In ZenFlow, executing async form submissions without giving user feedback or disabling inputs leads to multiple unexpected clicks and confusion.
**Action:** Always establish a consistent UX pattern by implementing an explicit loading state (via `loading={isLoggingIn}`) on the submit `<Button>` and visibly disabling all interactive form inputs (e.g., using `disabled:opacity-60 disabled:cursor-not-allowed`) during async actions.
