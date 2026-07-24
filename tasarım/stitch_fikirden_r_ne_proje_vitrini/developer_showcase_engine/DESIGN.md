---
name: Developer Showcase Engine
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5b403d'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8f6f6c'
  outline-variant: '#e4beb9'
  surface-tint: '#b91c1c'
  primary: '#93000b'
  on-primary: '#ffffff'
  primary-container: '#b91c1c'
  on-primary-container: '#ffcdc7'
  inverse-primary: '#ffb4ab'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#004394'
  on-tertiary: '#ffffff'
  tertiary-container: '#005ac2'
  on-tertiary-container: '#c9d8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  success: '#10b981'
  warning: '#f59e0b'
  border-subtle: '#e5e7eb'
  surface-white: '#ffffff'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is engineered for a "Developer-Focused" ecosystem, prioritizing clarity, speed, and functional aesthetics. It draws inspiration from modern deployment platforms and version control interfaces, emphasizing the journey from "Idea to Product" through a high-fidelity, utilitarian lens.

The aesthetic is **Modern Minimalism**. It utilizes heavy whitespace to reduce cognitive load and relies on precise information hierarchy rather than decorative elements. The visual language is structured, using thin borders and a strict grid to evoke a sense of stability and technical excellence. It is designed to feel like a high-performance tool that empowers creators to showcase their technical prowess with professional polish.

## Colors

The color strategy is anchored by a high-contrast relationship between the brand primary and a deep neutral palette. This ensures accessibility while maintaining a professional "SaaS" appearance.

- **Primary Red (#b91c1c):** Reserved for core brand identity, primary actions, and critical focus states.
- **Surface & Backgrounds:** The application uses a very light neutral gray (`#f9fafb`) for the background to distinguish it from the pure white (`#ffffff`) surfaces of cards and modals.
- **Typography:** Text levels use a tiered grayscale approach. Primary text is nearly black (`#111827`) to maximize legibility, while secondary text uses a softer gray (`#4b5563`) for metadata and labels.
- **Semantic Accents:** Success, Warning, and Info colors are used strictly for status indicators (Badges, AI verification, and Approval states) to maintain a clean, non-distracting UI.

## Typography

This design system utilizes **Inter** across all levels to maintain a cohesive, systematic feel. The typographic scale is designed for high density and rapid scanning.

- **Headings:** Utilize tighter letter spacing (`-0.01em` to `-0.02em`) and bold weights to create a distinctive, editorial impact that feels "engineered."
- **Body Text:** Focuses on legibility with a `leading-relaxed` (1.5 - 1.6) line height.
- **System Labels:** Used for badges, buttons, and status indicators. These use slightly heavier weights (Medium/Semibold) and increased letter spacing to ensure they remain distinct from body prose even at small sizes.

## Layout & Spacing

The design system follows a **Fixed-Fluid Hybrid Grid**. Content is centered within a 1280px container on desktop, while margins and internal padding scale fluidly on smaller viewports.

- **Grid:** A standard 12-column grid is used for desktop. For project galleries, a responsive grid of 1 column (mobile), 2 columns (tablet), and 3 columns (desktop) is recommended.
- **Rhythm:** A 4px/8px baseline power-of-two scale is used for all internal component spacing to ensure visual mathematical harmony.
- **Mobile-First:** Layouts must prioritize a single-column stack with full-width buttons before expanding into multi-column layouts using Tailwind-inspired breakpoints (`md: 768px`, `lg: 1024px`).

## Elevation & Depth

This design system avoids heavy shadows and physical metaphors in favor of **Tonal Layers and Thin Outlines**. 

- **Surface Tiers:** Backgrounds use a slightly off-white gray, while interactive components (cards, inputs) use pure white to "pop" forward visually.
- **Outlines:** Depth is primarily communicated through `1px` borders using the `border-subtle` token (#e5e7eb). This creates a crisp, technical look.
- **Shadows:** Use a "Diffuse Shadow" approach. Shadows should be nearly invisible, providing just enough depth to separate a card from the background. 
  - *Standard Shadow:* `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)`
- **Interactive Depth:** On hover, cards should transition to a slightly more pronounced shadow or a subtle border color shift rather than a physical lift.

## Shapes

The shape language is "Soft-Modern," utilizing subtle rounding to balance the clinical nature of the typography and grid.

- **Components:** Buttons, inputs, and cards use a `0.25rem` (rounded-md) radius. This provides a professional, "tool-like" appearance that isn't as aggressive as sharp corners nor as casual as pill shapes.
- **Badges:** As an exception, status badges and tags use `rounded-full` (pill-shaped) to distinguish them from interactive buttons and structural cards.

## Components

### Buttons
- **Primary:** Solid `#b91c1c` with white text. No gradient. 
- **Secondary:** White background with `#e5e7eb` border and `#111827` text.
- **Interaction:** Hover states involve a 10% darkening of the background color. Active states use a subtle inner shadow.

### Cards
- **Construction:** Pure white background, `1px` border in `border-subtle`, and `shadow-sm`.
- **Project Cards:** Should feature a structured header with the project name and a right-aligned semantic badge.

### Badges & Tags
- **Semantic Badges:** Use a "Soft Tint" style. A low-opacity background of the semantic color with high-contrast text of the same hue (e.g., AI Badge: Light blue background, bold blue text).
- **Verification:** The "Approved" badge should include a small checkmark icon alongside the text for accessibility.

### Input Fields
- **Default:** `1px` border with `4px` padding.
- **Focus State:** A `2px` ring using the Primary Red color at 20% opacity, with the border color shifting to the solid Primary Red.

### Lists & Data Rows
- Use horizontal dividers (`1px` border-top) rather than boxed containers for lists to maintain a clean, developer-centric "log" or "feed" aesthetic.