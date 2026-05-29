## 2024-05-18 - Added Login Spinner
**Learning:** The existing `<Button>` component inside `components/ui/` has native support for a `loading={bool}` property which perfectly fits adding loading states to submit actions without requiring manual `Spinner` wrapping or custom CSS.
**Action:** Always check the properties of shared `ui` components before building custom loading or spinner logic in the main components.
