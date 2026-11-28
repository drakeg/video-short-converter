# Video Shorts Studio — visual identity

## Direction
**Production desk, not a marketing template.** A focused editing workspace for creators handling their own footage: strong editing hierarchy, a recognizable upload surface and minimal visual noise. The identity refresh is a designer-selected direction, not an approved customer-provided logo or a rebrand of the repository. The existing favicon remains in place.

## Palette and usage
| Token | Value | Role |
| --- | --- | --- |
| Ink | `#0b111c` | Page background |
| Canvas | `#172234` | Editor panel |
| Raised surface | `#202f43` | Secondary controls |
| Lime | `#c9fa72` | Main actions, positive emphasis and focus |
| Cyan | `#7bdbe9` | Secondary emphasis |
| Primary text | `#f2f6fa` | Text on dark panels |
| Muted text | `#afc0cf` | Guidance and supporting content |

The studio-specific styles are scoped to `.studio-shell` and `.studio-workspace` in `src/app/globals.css`; modal content deliberately remains light. Existing sign-in and account UI are outside this scope.

## Typography and assets
Use system-safe Helvetica Neue/Arial for interface text and condensed Arial Narrow fallbacks for marketing display. No new proprietary fonts, imagery, icon packs or third-party dependencies were introduced. Hero iconography uses the existing licensed Heroicons dependency. The film-frame monogram is a styled instance of an existing icon, **not** a new approved logo asset.

## UX / accessibility contract
- Source-video dropzone remains an actual native file input with a visible keyboard focus state.
- Primary editor tasks retain their existing behavior and accessible labels.
- High-contrast focus ring and reduced-motion styling are scoped to the studio.
- Responsive layouts use existing Tailwind breakpoints; editing panels flow into one column at narrower widths.
- Instructions are still available from the hero; modal has dialog labeling.

## Component selection
**Retain Tailwind CSS 4 and current React components.** daisyUI, HeroUI, AlignUI and Ant Design were considered but bring additional styles or dependencies to controls that already work. No framework migration is justified by this visual-only increment. Avoid generic cross-project branding.

## Verification
CI typecheck, lint, unit tests and production build must pass. Real browser visual QA at 390, 768, 1024 and 1440 px; keyboard-only navigation; modal focus behavior; form contrast; light/dark theme switching; and video export workflows remain follow-up checks until executed. Do not mark them passed based on appearance of the source code alone.

## Studio instructions keyboard behavior (Sprint 87)
The help dialog moves focus to its Close control, contains Tab/Shift+Tab navigation, closes on Escape or backdrop activation, and restores focus to the previous control. Automated coverage is required; actual browser and screen-reader verification remain pending.
