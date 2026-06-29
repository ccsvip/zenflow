## 2026-06-29 - [Consistent Async Form UX Pattern]
**Learning:** Establishing a clear visual feedback loop for async operations is crucial. Failing to disable form inputs or provide a loading indicator can lead to user confusion, duplicate submissions, and a perceived lack of responsiveness.
**Action:** Always implement a loading state for async form submissions. explicitly disable interactive elements (like inputs and buttons) using standard disabled attributes and Tailwind styling, and pass a loading prop to submission buttons to indicate ongoing background activity.
