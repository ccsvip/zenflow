## 2024-05-22 - [Add Loading State and Autocomplete to Login Form]
**Learning:** Found that the login form was missing crucial loading states during API requests and autocomplete attributes for password managers. These are critical accessibility and usability features.
**Action:** Always ensure that form submissions handling network requests provide immediate visual feedback (like a disabled loading spinner button) and that standard inputs like username/password have the appropriate `autoComplete` tags to help users utilizing password managers.
