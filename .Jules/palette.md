## 2024-05-30 - Form Submit Loading State
**Learning:** Adding a visual loading state to async form submissions (especially login) significantly improves perceived performance and prevents duplicate submissions. Passing `loading` to a central `<Button>` component and disabling inputs creates a unified UX pattern.
**Action:** Always check async operations in forms to ensure they provide clear loading feedback and disable interactive elements to avoid redundant requests.
