# Accessibility Baseline (Required)

Use this checklist for all existing and new UI containers/components.

## Mandatory rules

1. Use semantic landmarks and structure:
- one `main` region per page
- use `header`, `section`, `article`, `footer` where appropriate
- headings must follow a logical order (`h1` -> `h2` -> `h3`)

2. Ensure keyboard compatibility:
- all interactive controls must be reachable via keyboard
- no click-only interactions
- visible `:focus-visible` state is required

3. Support screen readers:
- every form control must have a programmatic label
- icon-only controls need accessible names (`aria-label`)
- status/error updates must use live regions (`role="status"` or `role="alert"`)

4. Ensure media accessibility:
- meaningful images require descriptive `alt`
- decorative images must use empty alt (`alt=""`)

5. Respect user motion preferences:
- animations/transitions must degrade for `prefers-reduced-motion: reduce`

## Project enforcement

- Accessibility linting is enforced through `eslint-plugin-jsx-a11y` in `eslint.config.js`.
- Run `npm run lint` before every commit.
- Any new container/component must pass lint and follow the checklist above.
