# Design System

A shared visual language for website, admin, and mobile, so the three platforms read as
one product instead of three separately-styled apps. This is the source of truth other
platforms' config (Tailwind, MUI, Flutter `ThemeData`) is hand-kept in sync with — see
`web/packages/shared/src/design/tokens.ts` for the machine-readable copy of the same values.

## Why these choices

EdTech marketplaces live or die on trust (parents are paying strangers to teach their
kids) and clarity (a lot of state to communicate: verified/unverified, pending/confirmed,
online/offline). That drove three decisions: a blue primary (calm, trustworthy, not
alarming — avoid red/orange as the *brand* color since those read as warning colors
elsewhere in the same UI), a high-contrast accessible palette (WCAG AA minimum on all
text/background pairs), and a deliberately small semantic-color set so status badges
(verification status, booking status) stay legible at a glance rather than competing with
brand color for attention.

## Color Palette

### Brand (primary)
| Token | Light hex | Usage |
|---|---|---|
| `brand-50` | `#EEF6FF` | subtle backgrounds, hover states on light surfaces |
| `brand-100` | `#D9EAFF` | selected/active row backgrounds |
| `brand-300` | `#7FADF5` | disabled-but-visible accents |
| `brand-500` | `#2F6FED` | primary actions (buttons, links, focus rings) |
| `brand-600` | `#2557C7` | primary hover/pressed |
| `brand-700` | `#1D439C` | primary text-on-light-brand, high-emphasis |

### Neutral (text, surfaces, borders)
| Token | Light hex | Dark hex | Usage |
|---|---|---|---|
| `neutral-0` | `#FFFFFF` | `#0B0F17` | page background |
| `neutral-50` | `#F8FAFC` | `#111827` | card/surface background |
| `neutral-200` | `#E2E8F0` | `#293241` | borders, dividers |
| `neutral-500` | `#64748B` | `#94A3B8` | secondary text |
| `neutral-900` | `#0F172A` | `#F1F5F9` | primary text |

### Semantic (status only — never used for brand/decorative purposes)
| Token | Hex | Usage |
|---|---|---|
| `success-500` | `#16A34A` | verified, confirmed, completed |
| `warning-500` | `#D97706` | pending, awaiting action |
| `danger-500` | `#DC2626` | rejected, disputed, destructive actions |
| `info-500` | `#0891B2` | informational banners, in-progress |

Each semantic color has a `-50`/`-100` tint for badge backgrounds (e.g. `success-50`
background + `success-700` text for a "Verified" chip) so status pills stay legible in
both light and dark mode without pure-saturated fills fighting for attention.

## Typography

- **Website/Admin**: Inter (self-hosted via `next/font/google` — bundled at build time, no
  runtime request to Google, so no external dependency or CSP exception needed), system-ui
  fallback stack.
- **Mobile**: Material 3's default type scale (Roboto/SF per platform) — deliberately *not*
  overridden to a custom font. Loading a custom font in Flutter means bundling font assets
  and adds APK/IPA size + a maintenance surface for zero brand benefit at this stage;
  Material 3's default scale is already well-tuned for accessibility (dynamic type support).
- **Scale** (both platforms map onto the same rem/sp ratios): display (32/28), headline
  (24/20), title (18/16), body (16/14), label (14/12) — see tokens.ts for exact values.

## Spacing & Radius

- Spacing: 4px base unit (Tailwind's default scale, unmodified) — kept default rather than
  a custom scale because Tailwind's 4px scale already covers this product's needs and a
  custom scale would just be a source of drift between website/admin.
- Radius: `sm` 6px (inputs, badges), `md` 10px (buttons, cards), `lg` 16px (modals, large
  cards) — slightly rounded, not pill-shaped, to read as professional/institutional rather
  than playful (a deliberate contrast with more casual consumer-app aesthetics).

## Dark Mode

- **Website**: `class`-strategy Tailwind dark mode, toggled via a `ThemeToggle` component
  that persists the choice to `localStorage` and falls back to `prefers-color-scheme` when
  no explicit choice has been made.
- **Admin**: MUI `PaletteMode` state (`light`/`dark`), same persistence approach.
- **Mobile**: `ThemeMode.system` (follows OS setting) — no in-app toggle in this pass;
  admin/website need an explicit toggle because they're used in more varied lighting/desk
  contexts (long admin sessions), whereas mobile users already have a system-wide
  light/dark preference that most apps should simply respect.

## Component Inventory (Phase: Design System)

| Component | Website | Admin | Mobile |
|---|---|---|---|
| Button (primary/secondary/destructive/ghost) | `components/ui/Button.tsx` | MUI `Button` (themed) | `PrimaryButton` widget |
| Text input + label + error | `components/ui/Input.tsx` + `FormField.tsx` | MUI `TextField` (themed) | `AppTextField` widget |
| Card/surface | `components/ui/Card.tsx` | MUI `Card` (themed) | Material 3 `Card` (themed) |
| Status badge | `components/ui/Badge.tsx` | MUI `Chip` (themed) | (added when a mobile status-list screen needs it) |
| Loading spinner | `components/ui/Spinner.tsx` | MUI `CircularProgress` (themed) | Material `CircularProgressIndicator` (themed) |

## What was actually built (this pass)

- **Tokens**: `web/packages/shared/src/design/tokens.ts` (colors, radius, type scale, and
  status-color mappings consumed by both website and admin).
- **Website**: full Tailwind palette in `tailwind.config.ts`, Inter via `next/font/google`,
  flicker-free dark mode via `next-themes` (`ThemeProvider` + `ThemeToggle`), a UI primitive
  library (`Button`, `Input`, `FormField`, `Card`, `Badge`, `Spinner`) built on
  `class-variance-authority` + `clsx`/`tailwind-merge`, and an `AuthShell` layout wrapper.
  All three auth screens (login, register, OTP) and the home page were retrofitted onto
  these primitives — no more raw `<input>`/`<button>` with ad-hoc classes.
- **Admin**: `getTheme(mode)` builds a light/dark MUI theme from the same hex values,
  `ColorModeProvider` persists the user's light/dark choice to `localStorage`, `AdminShell`
  provides a top bar + side nav (`AppBar`/`Drawer`) matching the Phase 1 IA's admin route
  list, and the verification queue page now renders through MUI `Table`/`Chip` instead of
  a raw HTML table, with `toChipColor()` mapping the shared semantic status colors onto
  MUI's `Chip` color enum.
- **Mobile**: `AppTheme` extended beyond a bare seed color into full component theming
  (buttons, inputs, cards, chips, app bar) so Material 3's generated tonal palette is
  applied consistently rather than each screen styling its own widgets; `PrimaryButton`
  and `AppTextField` reusable widgets; all three auth screens retrofitted onto them.

## Known gaps

- **Mobile has no in-app theme toggle** (system-only) — a deliberate scope cut for this
  pass, not an oversight; see the Dark Mode section above for the reasoning. Revisit if
  user feedback wants it.
- **Admin's `globals.css`** still only imports `@tailwind components`/`utilities` (no
  `base`), inherited from the Phase 3 scaffold — harmless with `preflight: false`, but
  worth a look if any arbitrary-value Tailwind utility ever misbehaves in that app.
- **No Storybook or visual regression testing** was set up for the component library —
  reasonable to add once the primitive set stabilizes past this first pass, not before.

## Rule for future phases

From Phase 5 onward, **no new screen should hand-roll a `<button>`/`<input>`/raw MUI
component with ad-hoc styling** — use the primitives above (website/mobile) or the themed
MUI defaults (admin). If a screen needs a variant that doesn't exist yet, add it to the
shared primitive rather than one-off styling a single screen, so the three platforms don't
quietly re-diverge the way the Phase 4 auth screens did before this pass.
