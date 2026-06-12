## 2024-05-15 - [UX] Async Form Submissions Feedback
**Learning:** Adding a disabled and loading state to the submit button while simultaneously disabling interactive inputs gives users clear feedback that their submission is processing, and prevents duplicate submissions.
**Action:** When implementing async form submissions, establish a consistent UX pattern by passing a loading state to the submit `<Button>`'s `loading` prop, and explicitly disabling all interactive form inputs with Tailwind disabled classes (e.g., `disabled:opacity-60 disabled:cursor-not-allowed`).
