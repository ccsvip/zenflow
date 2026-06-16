## 2024-06-16 - Consistent Async Form Submission UX
**Learning:** When implementing async form submissions (like login), it is not enough to just add a loading spinner to the submit button. Users might still attempt to modify input fields during the request, leading to confusing state or validation errors if the request fails.
**Action:** Establish a consistent UX pattern: passing a loading state to the submit `<Button>`'s `loading` prop, and explicitly disabling all interactive form inputs with Tailwind disabled classes (e.g., `disabled:opacity-60 disabled:cursor-not-allowed`).
