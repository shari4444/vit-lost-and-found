---
name: Academic Registry UI
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#44474d'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#75777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#4d5f7d'
  primary: '#000615'
  on-primary: '#ffffff'
  primary-container: '#0b1f3a'
  on-primary-container: '#7587a7'
  inverse-primary: '#b5c7ea'
  secondary: '#515f76'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3ff'
  on-secondary-container: '#57657d'
  tertiary: '#000616'
  on-tertiary: '#ffffff'
  tertiary-container: '#151f31'
  on-tertiary-container: '#7d879d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b5c7ea'
  on-primary-fixed: '#071c36'
  on-primary-fixed-variant: '#364764'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b9c7e2'
  on-secondary-fixed: '#0d1c30'
  on-secondary-fixed-variant: '#3a475e'
  tertiary-fixed: '#d9e3fb'
  tertiary-fixed-dim: '#bdc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3d475a'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  headline-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: '0'
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  margin-desktop-max: 5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system projects academic integrity, precision, and institutional reliability. Tailored for a university campus environment, it addresses both students and faculty during stressful, high-urgency moments (retrieving essential items like IDs, keys, calculators, and electronics) as well as day-to-day administrative stewardship.

### Design Principles & Visual Style
- **Institutional Authority:** Grounded in collegiate structure—rational grid alignments, strict typographical hierarchies, and restrained visual treatments that convey administrative certitude.
- **Utilitarian Clarity:** High data density organized with generous whitespace rhythm. Essential metadata (date, location, verification status, custody log) is surfaced immediately without clutter.
- **Restrained Polish:** Surfaces rely on tactile, fine-line micro-borders (1px) and whisper-soft shadows rather than loud SaaS gradients or neo-brutalist novelties.
- **Trustworthy Predictability:** Uniform component structures and sober, accessible status accents establish an unambiguous operational environment.

## Colors

The palette leverages a classic collegiate contrast between Deep Navy foundations, clean warm-white surfaces, and crisp boundary dividers.

### Core Role Assignments
- **Primary (`#0B1F3A`):** Deep Navy. Anchors top navigation bars, key administrative actions, primary interactive buttons, and high-emphasis display titles.
- **Secondary (`#07162A`):** Dark Navy. Reserved for high-contrast mastheads, footers, deep overlays, and dark-mode systemic primitives.
- **Surface Canvas (`#F7F5F0`):** Warm Off-White. Provides a calm, low-glare canvas across portals and page layouts.
- **Surface Elevated (`#FFFFFF`):** Pure White. Exclusively used for interactive cards, sheets, data tables, modals, and input fields.
- **Borders & Dividers (`#E7E7E3`):** Soft Architectural Gray. Enforces structural grid boundaries across panels and data columns at 1px thickness.
- **Neutral Typography:**
  - Primary Content: `#0B1F3A` (maximum legibility and high institutional contrast).
  - Secondary/Muted: `#667085` (metadata, timestamps, breadcrumbs, table headers).

### Functional Status Indicators
Status colors use subdued tones paired with low-saturation container fills:
- **Matched / Collected:** Text `#12B76A` against Surface `#ECFDF3` with Border `#A6F4C5`.
- **Pending / Verification:** Text `#B54708` (high contrast amber) against Surface `#FFFAEB` with Border `#FEDF89`.
- **Cancelled / Rejected:** Text `#D92D20` against Surface `#FEF3F2` with Border `#FECDCA`.
- **Informational / Available:** Text `#0B1F3A` against Surface `#F0F4F8` with Border `#D0DCE7`.

## Typography

The type system blends the contemporary, structured geometry of Plus Jakarta Sans for structural headings with the utilitarian readability of Inter for body text, numerical records, and metadata labels.

### Typographic Hierarchy Rules
- **Headlines:** Use Plus Jakarta Sans in semi-bold and bold weights with subtle negative tracking (`-0.01em` to `-0.02em`) to command structural authority without ostentation.
- **Body & Data Tables:** Use Inter with tabular numerical figures (`tnum`) enabled by default across inventory ledgers, item IDs, dates, and timestamp columns.
- **Labels & Micro-copy:** Render system codes, campus block identifiers, and status pill badges in upper or mixed-case using `label-sm` or `label-md` with slight positive tracking (`+0.02em` to `+0.04em`) to ensure legibility at compact dimensions.

## Layout & Spacing

The layout employs a fixed-max-width grid with responsive fluid scaling:
- **Desktop (>= 1200px):** 12-column layout, max content container constrained to `1280px`, centered with `gutter: 1.5rem` and fluid margins up to `5rem`.
- **Tablet (768px - 1199px):** 8-column layout, `gutter: 1.5rem`, `margin: 1.5rem`.
- **Mobile (< 768px):** 4-column layout, `gutter-mobile: 1rem`, `margin-mobile: 1rem`.

### Spatial Rhythm
- Apply strict 4px/8px incremental padding for internal components.
- Maintain `space-lg` (`1.5rem`) within cards for standard metadata displays, dropping to `space-md` (`1rem`) on mobile devices.
- Group related metadata pairs (e.g., "Found Location: Technology Tower") using `space-xs` vertically, and separate metadata groups with `space-sm` or `space-md`.

## Elevation & Depth

To sustain a clean academic aesthetic, elevation relies primarily on structural borders and delicate micro-shadows rather than dramatic blurred drops.

### Elevation Hierarchy
- **Canvas Base (`#F7F5F0`):** Level 0. Flat background; no shadow.
- **Level 1 (Card & Module Resting):**
  - Background: `#FFFFFF`
  - Border: `1px solid #E7E7E3`
  - Shadow: `0px 1px 2px rgba(11, 31, 58, 0.04), 0px 1px 3px rgba(11, 31, 58, 0.06)`
- **Level 2 (Interactive Hover & Flyout Panels):**
  - Background: `#FFFFFF`
  - Border: `1px solid #D0DCE7`
  - Shadow: `0px 4px 6px -1px rgba(11, 31, 58, 0.07), 0px 2px 4px -2px rgba(11, 31, 58, 0.05)`
- **Level 3 (Modals, Verifications & Claim Overlays):**
  - Background: `#FFFFFF`
  - Border: `1px solid #E7E7E3`
  - Shadow: `0px 12px 16px -4px rgba(11, 31, 58, 0.08), 0px 4px 6px -2px rgba(11, 31, 58, 0.03)`

## Shapes

The design system embraces disciplined, architectural geometry. High-radius or pill forms are avoided for containers, maintaining institutional sobriety.

### Radius Token Scale
- **Default Radius (0.25rem / 4px):** Applied to form fields, nested micro-chips, action checkboxes, and data table rows.
- **Medium Radius (`rounded-lg`, 0.5rem / 8px):** Applied to container cards, item image thumbnails, modal windows, and search filters.
- **Maximum Radius (`rounded-xl`, 0.75rem / 12px):** Applied exclusively to floating dialogs and segmented primary dashboards.
- Status badges and contextual tags use a controlled 4px corner radius (`rounded`) rather than full pill caps, preserving a crisp, dossier-like appearance.

## Components

### Buttons
- **Primary:** Solid `#0B1F3A` background, `#FFFFFF` text, 1px `#0B1F3A` border. Hover state transitions to `#07162A`. Active state scales subtly (`scale(0.99)`). Border-radius: 6px. Internal padding: `0.625rem 1.25rem`.
- **Secondary / Outline:** Pure `#FFFFFF` background, `#0B1F3A` text, 1px solid `#E7E7E3` border. Hover state applies `#F7F5F0` background and `#0B1F3A` border.
- **Destructive:** `#FEF3F2` background, `#D92D20` text, 1px solid `#FECDCA`. Hover state shifts to `#FEE4E2`.

### Status Badges & Chips
- Compact dimensions: height 24px, padding `0.125rem 0.5rem`, corner radius 4px.
- Uses subtle 1px matching borders and high-contrast typography:
  - *Matched / Collected:* Background `#ECFDF3`, Text `#027A48`, Border `#A6F4C5`.
  - *Pending Verification:* Background `#FFFAEB`, Text `#B54708`, Border `#FEDF89`.
  - *Rejected / Closed:* Background `#FEF3F2`, Text `#B42318`, Border `#FECDCA`.
  - *Available / Logged:* Background `#F0F4F8`, Text `#0B1F3A`, Border `#D0DCE7`.

### Input Fields & Search Bars
- Background: `#FFFFFF`.
- Border: 1px solid `#E7E7E3`.
- Focus State: 1px solid `#0B1F3A` with a subtle focus ring `0 0 0 3px rgba(11, 31, 58, 0.08)`.
- Sizing: standard height 40px, padding `0.5rem 0.875rem`, placeholder text `#98A2B3`.

### Data Cards & Item Cards
- Surfaces are `#FFFFFF`, framed with 1px `#E7E7E3` borders and 8px border-radius.
- Internal separation: Image thumbnail (fixed ratio 4:3) with an inset border, followed by a metadata stack:
  1. Top row: Category tag + relative timestamp (`body-sm`, `#667085`).
  2. Core row: Item Title (`headline-sm`, `#0B1F3A`).
  3. Detail row: Campus Location + Custody ID in tabular numerals (`label-md`).
  4. Footer: Status badge aligned left, contextual verification CTA aligned right.

### Tables & Log Rows
- Header row styled in `#F7F5F0` with uppercase `label-sm` text (`#667085`) and a 1px solid bottom divider (`#E7E7E3`).
- Alternating row interaction: Pure White resting state, shifting to `#F9F9F8` on cursor hover. Cell padding `0.75rem 1rem`.