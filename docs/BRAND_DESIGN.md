# HarborX visual identity

The public homepage is the reference for the shared CSS identity. Active visual
values live in `frontend/src/tokens/tokens.css`; existing semantic and legacy
variables remain available. `workspace.css` aliases its previous local palette to
these tokens rather than introducing another identity.

| Token                    | Value     | Purpose                                             |
| ------------------------ | --------- | --------------------------------------------------- |
| `--hx-brand-teal`        | `#087F7E` | Primary controls, links, mark, focus                |
| `--hx-brand-teal-hover`  | `#056965` | Existing hover and stronger link colors             |
| `--hx-brand-navy`        | `#102F3D` | Headings and application navigation                 |
| `--hx-brand-ink`         | `#183B46` | Body and form text                                  |
| `--hx-brand-seafoam`     | `#A6E7D8` | Wordmark accent on dark surfaces                    |
| `--hx-brand-canvas`      | `#F6F8F5` | Quiet page backgrounds                              |
| `--hx-brand-muted`       | `#536B73` | Helper and secondary text                           |
| `--hx-brand-border`      | `#E0E8E7` | Neutral borders                                     |
| `--hx-brand-radius`      | `6px`     | Existing workspace controls and auth fields/buttons |
| `--hx-brand-mark-radius` | `4px`     | Geometric brand mark                                |

White on primary teal has a 4.83:1 contrast ratio. Helper text is darker than the
previous homepage muted color. Success, warning, danger, informational badges,
charts, auction states and alerts retain their existing semantic colors.

Body text, navigation, forms, dashboard headings, data and numbers use Arial,
Helvetica, Noto Sans Tamil, Noto Sans Sinhala, Tamil MN, Sinhala MN, sans-serif.
Promotional and authentication headings use Georgia, Times New Roman, Noto Serif
Tamil, Noto Serif Sinhala, Tamil MN, Sinhala MN, serif. Fonts are local fallbacks;
no network fonts or dependencies are added. The selected Tamil/Sinhala face
therefore depends on the device's installed fonts. Translation content and the
language provider are unchanged.

The shared `Logo` uses the homepage's original H-and-wave SVG and tagline. Its
existing light, collapsed and accessibility interfaces remain intact; the public
homepage keeps its existing brand link. Typography, border radius and color
changes do not alter the split auth layout, field order, dashboard structure,
responsive breakpoints or navigation.

## Motion preservation

No new motion is introduced. `PageTransition.jsx`, its CSS module, router
integration, both slideshow components and application logic are unchanged from
the starting working tree. All existing CSS animation/transition/transform/opacity
declarations, motion tokens and keyframes were compared exactly against the
starting snapshot, including declarations inside stylesheets receiving visual
edits. Page transitions remain 400 ms with their existing easing and 10 px native
horizontal motion; their existing Back/Forward fallback is unchanged. Both
slideshows retain their 4-second intervals, 2-second crossfades, image lists,
visibility/reduced-motion behavior and existing continuity rules.

## Visual review

`artifacts/brand-consistency/index.html` compares 24 before/after screenshots:
homepage, Login, Registration, Seller, Buyer and Admin at 1440 px and 390 px.
Screenshots use reduced motion to hold the same first photograph; animated
behavior is separately verified by the unchanged browser animation tests.
Screenshots use seeded demonstration accounts against the disposable in-memory
test server, without reading or changing the developer's database.

`artifacts/brand-consistency/animation-preservation.json` records before/after
hashes of protected files and CSS motion declarations. The previous uncommitted
transition implementation and its tests remain intact.

Scope deliberately excludes a dashboard redesign and recoloring semantic status
indicators. Some secondary legacy panels and informational accents retain their
existing styling. The unused JavaScript token export remains unchanged; rendered
pages consume the shared CSS variables.
