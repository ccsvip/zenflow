## 2025-02-12 - Added show/hide password toggle and login loading state
**Learning:** The login page password field lacked a way to inspect the entered password, which degrades user confidence and accessibility. The submit button lacked a visual indicator while awaiting the response, leading to uncertainty if the click was registered.
**Action:** When working on login or sensitive input forms, always check if a show/hide toggle is present. For async actions, verify that a loading state indicator is wired to the button to prevent double-clicks and reassure users.
