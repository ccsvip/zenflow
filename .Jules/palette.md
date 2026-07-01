## 2026-07-01 - [Added a11y links in Modal Forms]
**Learning:** Found a recurring pattern in modal forms (e.g., projectModal) where labels lacked `htmlFor` and inputs lacked `id`. This missing link prevents screen readers from associating fields with their labels and disables clicking the label to focus the input.
**Action:** When working on modal forms in this design system, always verify and explicitly add `htmlFor` and `id` attributes to improve keyboard access and screen reader support.
