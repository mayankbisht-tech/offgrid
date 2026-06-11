---
name: Sunset Editorial
colors:
  surface: '#fff8f5'
  surface-dim: '#ebd6c7'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e8'
  surface-container: '#ffeadb'
  surface-container-high: '#fae4d5'
  surface-container-highest: '#f4dfcf'
  on-surface: '#241910'
  on-surface-variant: '#5c4037'
  inverse-surface: '#3a2e24'
  inverse-on-surface: '#ffeee2'
  outline: '#916f65'
  outline-variant: '#e6beb2'
  surface-tint: '#ae3200'
  primary: '#aa3000'
  on-primary: '#ffffff'
  primary-container: '#d43f00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59e'
  secondary: '#4f6600'
  on-secondary: '#ffffff'
  secondary-container: '#bdf200'
  on-secondary-container: '#526b00'
  tertiary: '#635a55'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d736d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#c0f500'
  secondary-fixed-dim: '#a8d700'
  on-secondary-fixed: '#161f00'
  on-secondary-fixed-variant: '#3b4d00'
  tertiary-fixed: '#ede0d9'
  tertiary-fixed-dim: '#d1c4bd'
  on-tertiary-fixed: '#211a16'
  on-tertiary-fixed-variant: '#4d4540'
  background: '#fff8f5'
  on-background: '#241910'
  surface-variant: '#f4dfcf'
typography:
  display-lg:
    fontFamily: Syne
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Syne
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Syne
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Syne
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
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system embodies a "High-Contrast Editorial" aesthetic that bridges the gap between luxury publishing and contemporary streetwear. The brand personality is bold, avant-garde, and unapologetically expressive, targeting a creative audience that values both intellectual depth and high-energy visual impact.

The design style leverages **Minimalism** as a foundation—utilizing generous whitespace and a rigorous grid—but punctuates it with **High-Contrast / Bold** accents. The emotional response should be one of "warm intensity": the sophisticated, creamy background provides a sense of calm, while the sharp typography and electric accent colors evoke a sense of urgency and modern edge.

## Colors

The palette is anchored by a warm, textured gradient background that mimics heavy-stock editorial paper at golden hour. 

- **Primary Accent (#FF4D00):** A punchy "International Orange" used for high-priority actions and brand-heavy moments. It should be used sparingly but with high impact.
- **Secondary Accent (#C8FF00):** A technical "Lime" that provides a sharp, dissonant contrast to the warm base, ideal for notifications, highlights, or secondary interactive states.
- **Typography:** The primary text uses a deep, warm black (#1A1410) to maintain legibility without the harshness of pure black, while muted text employs a warm brown-grey (#8C7B6E) for metadata and secondary info.
- **Surfaces:** Pure white (#FFFFFF) is reserved for floating cards to provide maximum lift, while a secondary beige (#FDF6EE) handles nested elements and input fields.

## Typography

The typography strategy relies on a "Dual-Tone" hierarchy. **Syne** is used for all display and headline roles, bringing a distinctive, wide, and experimental character to the interface. **Inter** serves as the workhorse for body copy and UI labels, ensuring that despite the expressive headlines, the functional data remains highly readable and systematic.

Large display type should utilize tight line heights and negative letter spacing to create a "blocky," editorial feel. Labels and small captions should leverage uppercase styling and tracking to contrast against the fluid shapes of the display face.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop (12 columns, 1200px max-width) and a **Fluid Grid** for mobile (4 columns). The spacing rhythm is strictly based on a 4px baseline, ensuring all elements align to a predictable vertical and horizontal cadence.

In editorial sections, "asymmetric breathing room" is encouraged—using larger `xxl` padding on one side of a container to create a dynamic, unbalanced look characteristic of modern magazines. On mobile, margins tighten to 16px to maximize content real estate while maintaining a clear gutter of 20px between columns.

## Elevation & Depth

This design system rejects heavy shadows in favor of **Tonal Layers** and **Low-contrast Outlines**. 

- **Depth through Color:** Hierarchy is established by placing Surface 1 (White) cards against the warm gradient background. 
- **Borders:** All primary containers and interactive elements use a 1px solid border (#EDE4D8). This "ghost border" approach provides structure without adding visual weight.
- **Active State Shadows:** When an element is focused or active, use a sharp, 4px offset shadow (non-diffused) in the Primary Accent color (#FF4D00) to mimic a "printed" or "stamped" effect rather than a realistic light source.

## Shapes

The shape language is "Tailored Precision." A consistent 4px radius (`roundedness: 1`) is applied to almost all components, including buttons, cards, and input fields. This subtle rounding softens the brutalism of the grid just enough to feel modern and premium without becoming "bubbly."

Iconography should follow this rule, using paths with 1px or 2px corner radii to match the UI's structural "Soft" setting. Large images or hero sections may occasionally use sharp 0px corners to emphasize the editorial grid.

## Components

- **Buttons:** Primary buttons use a solid #FF4D00 fill with white text. They are rectangular (4px radius) and use bold Inter labels. Secondary buttons use a #1A1410 border and text with no fill.
- **Chips:** These are used for tagging; they should have a #C8FF00 (Lime) background with #1A1410 text for high-energy categorization.
- **Inputs:** Use Surface 2 (#FDF6EE) for the fill to differentiate from the White background cards. Borders remain #EDE4D8. Labels are always `label-sm` (uppercase).
- **Cards:** White background, 1px border (#EDE4D8), and 4px corner radius. Padding should be generous (`lg` or `xl`).
- **Lists:** Clean, border-bottom separators (#EDE4D8) with no icons unless necessary for navigation.
- **Checkboxes/Radios:** Should be strictly geometric. When checked, the fill is #FF4D00.
- **Editorial Callouts:** Large-scale components featuring a Secondary Accent (#C8FF00) border-left at 4px thickness to draw attention to pull-quotes or key insights.