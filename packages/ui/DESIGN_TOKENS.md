# Design tokens

Use semantic tokens rather than feature-specific colors: canvas, surface, text, muted text, border, primary action, focus, success, warning, and danger. The initial web implementation uses slate surfaces, teal actions, and system status colors with text labels so color is never the only signal.

Spacing follows a 4 px base rhythm. Controls should retain a minimum practical touch target, visible keyboard focus, sufficient contrast, and Thai text expansion room. Promote these values into code only when a second consumer establishes a real sharing requirement.

## Reference-aligned Pastel Mint web theme

The web application uses a calm, Thai-first healthcare-support direction:

- canvas `#f5fbfa`, surface `#ffffff`, and soft surface `#effbf8`;
- ink `#0f172a`, muted text `#52637c`, and border `#c9eeea`;
- logo cyan `#48a7b8` and mint `#74dfbd`, taken from `apps/web/public/logo.svg`;
- pastel action `#78bfbc`, gradient endpoint `#7db8b4`, and hover `#66aeaa`, following the approved camera-setup reference;
- navy action labels `#0f172a` instead of white preserve readable contrast on pastel backgrounds;
- teal text/focus `#007f78` and strong teal `#006f69` are for links, icons and focus, not large dark action fills;
- soft mint accent `#dff8f1` and strong accent `#b9eee0`; preserve logo artwork unchanged;
- account/navigation surfaces stay white or pale cyan with dark text; browser/PWA theme color is pastel teal `#78bfbc`;
- established emerald, amber, and red system colors only for labelled status, caution, and danger states.

The primary web typeface is the self-hosted Noto Sans Thai variable family. Use real weights 400, 500, 600, and 700, comfortable Thai line height, and tabular numerals for timers and activity statistics. Runtime pages must not depend on a third-party font request.

Shared web cards use a 20 px radius, quiet borders, and restrained depth. Buttons and fields retain a minimum 44 px target. Prefer hierarchy and whitespace over adding cards, pills, gradients, or shadows.

## Browser language

At each page load, select the first supported Thai or English language from `navigator.languages`, including regional variants such as `th-TH` and `en-US`. Use `navigator.language` when the list is empty. Fall back to English if no supported language is found or browser preferences cannot be read.

Manual language changes stay in the existing i18n instance during client-side navigation. Reloading re-evaluates browser preferences. Do not read, write, or delete a language preference in browser storage. Unit tests and existing Thai browser journeys explicitly use a Thai browser locale; language-specific tests override it to exercise the other startup paths.
