# Design System v2 — Dynamic Theming

The first design-system pass (`docs/phase-design-system/README.md`) hardcoded one palette
into Tailwind config, MUI's `theme.ts`, and Flutter's `AppTheme` — three separate places
that happened to agree on the same hex values. This pass replaces "three files hand-kept
in sync" with **one runtime-resolved token source**, so switching the active theme is a
state change, not a code change, on every platform.

## Architecture

`web/packages/shared/src/design/tokens.ts` now exports a `ThemeTokens` interface and a
`THEME_PRESETS` registry (`hometuitions-blue` — the original palette, kept as default so
nothing changes for existing users — and `emerald-campus`, a second real preset proving
the mechanism actually works end-to-end, not just typed). Each platform resolves a preset
into its own native theming mechanism at runtime:

| Platform | Mechanism |
|---|---|
| **Website** | `ThemeConfigProvider` writes `themeTokensToCssVars(tokens)` onto `document.documentElement` as CSS custom properties (`--color-brand-500`, etc). `tailwind.config.ts` was rewritten so every color resolves via `rgb(var(--color-brand-500) / <alpha-value>)` instead of a literal hex — meaning **every existing `bg-brand-500`/`text-danger-700` class in every already-built page re-themes automatically**, with zero component changes. `globals.css` sets static fallback values (the default preset) for correct first paint before any JS runs. |
| **Admin** | `getTheme(mode, tokens)` now takes a `ThemeTokens` parameter and builds `theme.palette.primary/success/warning/error/info` from it. A new `ThemePresetProvider` (sibling to the existing `ColorModeProvider`) holds the active preset name, persisted to `localStorage`. |
| **Mobile** | `AppThemeTokens` (Dart) mirrors the TS shape with the same preset names/values. `AppTheme.light(tokens)`/`.dark(tokens)` build `ColorScheme.fromSeed` from `tokens.brand500` instead of a hardcoded const. A `ThemePresetController` (Riverpod `Notifier`) persists the choice via `flutter_secure_storage`. Semantic status colors moved into a `ThemeExtension` (`AppStatusColors`) so they participate in `Theme.of(context)` and re-theme along with everything else, instead of being static top-level consts. |

A `ThemePresetSwitcher` control (present on the website's four shells + home page, the
admin top bar, and the mobile login screen) proves this isn't just plumbing — picking
"emerald-campus" re-themes every already-built page live, with no reload.

## UX elevation pass

Scoped, not exhaustive — the following got real polish; everything else still uses the
first design-system pass's baseline (functional, consistent, plain):

- **`Button`**: `active:scale-[0.98]` + `ease-out-expo` timing for tactile press feedback,
  replacing the bare `transition-colors`.
- **`Card`**: new `interactive` prop (hover lift + border tint + shadow) — replaces the
  ad-hoc `hover:border-brand-500` that the tutor search results page had hand-rolled on
  its own, so future clickable-card lists get the same treatment for free instead of each
  page reinventing it.
- **`EmptyState`**: a shared icon+message(+action) component, used on tutor search's
  no-results state and the bookings list's empty state — replacing plain `<p>No X
  yet</p>` text. Not rolled out to every list in the app (tickets, admin tables, etc.
  still use plain empty-row text) — worth extending opportunistically as those surfaces
  are next touched, not worth a mechanical sweep right now.
- **Home page hero**: a staggered `fade-in-up` entrance animation on the headline,
  subhead, and CTA row.

## Known gaps / honest scope note

- **"Every page dynamically"** was interpreted as: the *architecture* now makes every
  existing page theme-able dynamically (true — verified via the preset switcher), not
  that every individual page received bespoke new UX treatment (false — the elevation
  pass above lists exactly what did). Claiming otherwise would be a false completeness
  claim; flagging it explicitly instead.
- **Preset-switch FOUC on the website**: unlike the dark/light toggle (which uses
  `next-themes`' blocking inline script), a non-default preset chosen on a previous visit
  applies only after `ThemeConfigProvider`'s effect runs on mount — a brief flash of the
  default palette is possible on reload. Accepted because preset-switching is expected to
  be a rare settings action, not a per-visit choice; revisit with a duplicated inline
  script (like next-themes does) if that assumption stops holding.
- **No admin UI to define a *custom* (non-preset) theme** — only choosing between the two
  built-in presets is wired up. Real per-tenant custom color pickers would be additive on
  top of the same `ThemeTokens` shape, not a rework.
- **Mobile has no in-app dark-mode toggle** (still system-only, a deliberate decision
  carried over from the first design-system pass) — the new preset switcher only affects
  brand color, not light/dark.
