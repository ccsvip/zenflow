## 2024-06-21 - Form Submission UX Pattern
**Learning:** We need a consistent UX pattern for form submissions, including passing a loading state to the submit `<Button>`'s `loading` prop, and explicitly disabling all interactive form inputs.
**Action:** Found multiple async forms (login, save project, etc.) in `main.jsx` lacking loading states and disabled inputs during submission. I'll add `isLoggingIn` state to `main.jsx` and apply it to the login form, passing `loading={isLoggingIn}` to the Button and disabling inputs.
