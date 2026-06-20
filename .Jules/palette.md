## 2026-06-20 - [Login Form Loading State]
**Learning:** Adding explicit loading states to async forms is crucial. Without it, users may click submit multiple times or be unsure if the system is processing their request.
**Action:** Establish a consistent pattern for async form submissions: pass `loading` to the submit `<Button>` to trigger its built-in spinner, and explicitly disable all interactive inputs with `disabled` attribute and `disabled:opacity-60 disabled:cursor-not-allowed` tailwind classes.
