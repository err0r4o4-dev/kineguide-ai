# Design tokens

Use semantic tokens rather than feature-specific colors: canvas, surface, text, muted text, border, primary action, focus, success, warning, and danger. The initial web implementation uses slate surfaces, teal actions, and system status colors with text labels so color is never the only signal.

Spacing follows a 4 px base rhythm. Controls should retain a minimum practical touch target, visible keyboard focus, sufficient contrast, and Thai text expansion room. Promote these values into code only when a second consumer establishes a real sharing requirement.

## Calm Clinical Guidance web theme

The web application uses a calm, Thai-first healthcare-support direction:

- canvas `#f4f7f6`, surface `#ffffff`, and soft surface `#edf5f3`;
- ink `#142321`, muted text `#5f706d`, and border `#d7e2df`;
- primary teal `#0f766e` and strong primary `#0b5f59`;
- established emerald, amber, and red system colors only for labelled status, caution, and danger states.

The primary web typeface is the self-hosted Noto Sans Thai variable family. Use real weights 400, 500, 600, and 700, comfortable Thai line height, and tabular numerals for timers and activity statistics. Runtime pages must not depend on a third-party font request.

Shared web cards use a 20 px radius, quiet borders, and restrained depth. Buttons and fields retain a minimum 44 px target. Prefer hierarchy and whitespace over adding cards, pills, gradients, or shadows.

## Browser language

At each page load, select the first supported Thai or English language from `navigator.languages`, including regional variants such as `th-TH` and `en-US`. Use `navigator.language` when the list is empty. Fall back to English if no supported language is found or browser preferences cannot be read.

Manual language changes stay in the existing i18n instance during client-side navigation. Reloading re-evaluates browser preferences. Do not read, write, or delete a language preference in browser storage. Unit tests and existing Thai browser journeys explicitly use a Thai browser locale; language-specific tests override it to exercise the other startup paths.
