## 2026-05-20 - Added proper ARIA attributes to inputs and interactive elements
**Learning:** Found several buttons and inputs with missing accessible names or descriptions, preventing screen readers from understanding their purpose or context (e.g., error messages not tied to inputs, or generic "全部" (all) buttons missing contextual aria-labels).
**Action:** Always ensure that icon-only buttons or context-dependent buttons have descriptive `aria-label`s and that inputs use `aria-invalid` and `aria-describedby` to link to their respective error message containers.
