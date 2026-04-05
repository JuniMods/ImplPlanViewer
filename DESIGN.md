# Management UI Design System

A comprehensive design specification for a professional, sleek desktop management interface.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout Grid](#layout-grid)
6. [Components](#components)
7. [Icons](#icons)
8. [Shadows & Elevation](#shadows--elevation)
9. [Borders & Dividers](#borders--dividers)
10. [Animation & Transitions](#animation--transitions)
11. [Responsive Breakpoints](#responsive-breakpoints)
12. [Accessibility](#accessibility)

---

## Design Philosophy

- **Minimalist**: Clean interfaces with purposeful whitespace
- **Professional**: Corporate-appropriate aesthetics with subtle refinement
- **Efficient**: Optimized for mouse interaction with compact, precise controls
- **Consistent**: Unified visual language across all components
- **Scannable**: Clear visual hierarchy for rapid data comprehension

---

## Color System

### Primary Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Primary | `#2563EB` | `37, 99, 235` | Primary actions, active states, links |
| Primary Hover | `#1D4ED8` | `29, 78, 216` | Hover state for primary elements |
| Primary Active | `#1E40AF` | `30, 64, 175` | Active/pressed state |
| Primary Light | `#DBEAFE` | `219, 234, 254` | Backgrounds, highlights |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Gray 900 | `#111827` | `17, 24, 39` | Primary text, headings |
| Gray 700 | `#374151` | `55, 65, 81` | Secondary text |
| Gray 500 | `#6B7280` | `107, 114, 128` | Placeholder text, disabled |
| Gray 400 | `#9CA3AF` | `156, 163, 175` | Borders, dividers |
| Gray 200 | `#E5E7EB` | `229, 231, 235` | Light borders, separators |
| Gray 100 | `#F3F4F6` | `243, 244, 246` | Background secondary |
| Gray 50 | `#F9FAFB` | `249, 250, 251` | Background tertiary |
| White | `#FFFFFF` | `255, 255, 255` | Cards, panels, primary background |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#059669` | Success states, positive indicators |
| Success Light | `#D1FAE5` | Success backgrounds |
| Warning | `#D97706` | Warning states, caution indicators |
| Warning Light | `#FEF3C7` | Warning backgrounds |
| Error | `#DC2626` | Error states, destructive actions |
| Error Light | `#FEE2E2` | Error backgrounds |
| Info | `#0284C7` | Informational states |
| Info Light | `#E0F2FE` | Info backgrounds |

### Dark Mode Palette (Optional)

| Name | Hex | Usage |
|------|-----|-------|
| Background Primary | `#0F172A` | Main background |
| Background Secondary | `#1E293B` | Cards, panels |
| Background Tertiary | `#334155` | Elevated surfaces |
| Text Primary | `#F1F5F9` | Primary text |
| Text Secondary | `#94A3B8` | Secondary text |
| Border | `#475569` | Borders, dividers |

---

## Typography

### Font Family

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Type Scale

| Name | Size | Line Height | Weight | Letter Spacing | Usage |
|------|------|-------------|--------|----------------|-------|
| Display | `32px` | `40px` (1.25) | 600 | `-0.02em` | Page titles, hero text |
| Heading 1 | `24px` | `32px` (1.33) | 600 | `-0.01em` | Section headers |
| Heading 2 | `20px` | `28px` (1.4) | 600 | `-0.01em` | Card titles, subsections |
| Heading 3 | `16px` | `24px` (1.5) | 600 | `0` | Widget headers |
| Heading 4 | `14px` | `20px` (1.43) | 600 | `0` | Small headers |
| Body Large | `16px` | `24px` (1.5) | 400 | `0` | Emphasized body text |
| Body | `14px` | `20px` (1.43) | 400 | `0` | Default body text |
| Body Small | `13px` | `18px` (1.38) | 400 | `0` | Secondary information |
| Caption | `12px` | `16px` (1.33) | 400 | `0.01em` | Labels, captions, metadata |
| Overline | `11px` | `16px` (1.45) | 500 | `0.05em` | Category labels (uppercase) |
| Code | `13px` | `20px` (1.54) | 400 | `0` | Code snippets, IDs |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | `400` | Body text, descriptions |
| Medium | `500` | Emphasized text, buttons |
| Semibold | `600` | Headings, labels |
| Bold | `700` | Strong emphasis (use sparingly) |

---

## Spacing System

### Base Unit

**Base unit: `4px`**

All spacing values are multiples of the base unit for consistent rhythm.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | `0px` | No spacing |
| `space-1` | `4px` | Tight spacing: icon-to-text, inline elements |
| `space-2` | `8px` | Compact spacing: button padding, form gaps |
| `space-3` | `12px` | Default spacing: input padding, small gaps |
| `space-4` | `16px` | Standard spacing: card padding, section gaps |
| `space-5` | `20px` | Medium spacing: component separation |
| `space-6` | `24px` | Large spacing: section padding |
| `space-8` | `32px` | Extra large: major section separation |
| `space-10` | `40px` | Page section margins |
| `space-12` | `48px` | Large page sections |
| `space-16` | `64px` | Major layout divisions |

### Component-Specific Spacing

#### Buttons
- Horizontal padding: `12px` (small), `16px` (default), `20px` (large)
- Vertical padding: `6px` (small), `8px` (default), `10px` (large)
- Icon-to-text gap: `6px`
- Button group gap: `8px`

#### Cards
- Inner padding: `16px` (compact), `20px` (default), `24px` (spacious)
- Card-to-card gap: `16px`
- Header-to-content gap: `12px`
- Content section gap: `16px`

#### Forms
- Label-to-input gap: `6px`
- Input-to-input gap: `16px`
- Form section gap: `24px`
- Inline form element gap: `12px`

#### Tables
- Cell horizontal padding: `12px`
- Cell vertical padding: `10px`
- Header cell vertical padding: `12px`
- Row gap (if separated): `4px`

#### Lists
- Item vertical padding: `8px`
- Item horizontal padding: `12px`
- Nested indentation: `24px`
- Item-to-item gap: `4px` (compact), `8px` (default)

#### Navigation
- Nav item horizontal padding: `12px`
- Nav item vertical padding: `8px`
- Nav section gap: `24px`
- Sidebar padding: `16px`

---

## Layout Grid

### Container Widths

| Name | Max Width | Usage |
|------|-----------|-------|
| Full | `100%` | Full-width layouts |
| Wide | `1440px` | Dashboard, management views |
| Default | `1280px` | Standard content pages |
| Narrow | `1024px` | Focused content |
| Compact | `768px` | Forms, dialogs |

### Grid System

- **Columns**: 12-column grid
- **Gutter**: `24px` (desktop), `16px` (tablet)
- **Margin**: `32px` (desktop), `24px` (tablet), `16px` (mobile)

### Layout Regions

#### Sidebar Navigation
- Width: `240px` (expanded), `64px` (collapsed)
- Padding: `16px`
- Background: `White` or `Gray 50`

#### Top Header
- Height: `56px`
- Horizontal padding: `24px`
- Background: `White`
- Border bottom: `1px solid Gray 200`

#### Main Content Area
- Padding: `24px`
- Max width: Fluid (respects sidebar)

#### Right Panel (Optional)
- Width: `320px` (default), `400px` (wide)
- Padding: `16px`

---

## Components

### Buttons

#### Size Variants

| Size | Height | Min Width | Font Size | Border Radius | Padding |
|------|--------|-----------|-----------|---------------|---------|
| Extra Small | `24px` | `48px` | `11px` | `4px` | `4px 8px` |
| Small | `28px` | `64px` | `12px` | `6px` | `6px 12px` |
| Default | `32px` | `80px` | `13px` | `6px` | `8px 16px` |
| Large | `40px` | `96px` | `14px` | `8px` | `10px 20px` |

#### Button Variants

**Primary Button**
- Background: `Primary (#2563EB)`
- Text: `White`
- Border: `none`
- Hover: `Primary Hover (#1D4ED8)`
- Active: `Primary Active (#1E40AF)`
- Disabled: `Gray 300` background, `Gray 500` text

**Secondary Button**
- Background: `White`
- Text: `Gray 700`
- Border: `1px solid Gray 300`
- Hover: `Gray 50` background
- Active: `Gray 100` background

**Ghost Button**
- Background: `transparent`
- Text: `Gray 700`
- Border: `none`
- Hover: `Gray 100` background
- Active: `Gray 200` background

**Danger Button**
- Background: `Error (#DC2626)`
- Text: `White`
- Hover: `#B91C1C`
- Active: `#991B1B`

#### Icon Buttons

| Size | Dimensions | Icon Size | Border Radius |
|------|------------|-----------|---------------|
| Small | `24px × 24px` | `14px` | `4px` |
| Default | `32px × 32px` | `16px` | `6px` |
| Large | `40px × 40px` | `20px` | `8px` |

---

### Form Elements

#### Text Input

| Property | Value |
|----------|-------|
| Height | `32px` (small), `36px` (default), `40px` (large) |
| Padding | `8px 12px` |
| Border | `1px solid Gray 300` |
| Border Radius | `6px` |
| Font Size | `13px` (small), `14px` (default) |
| Background | `White` |
| Focus Border | `Primary (#2563EB)` |
| Focus Shadow | `0 0 0 3px Primary Light` |
| Error Border | `Error (#DC2626)` |
| Placeholder Color | `Gray 400` |

#### Select / Dropdown

| Property | Value |
|----------|-------|
| Height | `36px` |
| Padding | `8px 32px 8px 12px` |
| Border | `1px solid Gray 300` |
| Border Radius | `6px` |
| Arrow Icon Size | `16px` |
| Arrow Right Offset | `12px` |
| Dropdown Max Height | `240px` |
| Dropdown Item Height | `32px` |
| Dropdown Item Padding | `8px 12px` |

#### Checkbox

| Property | Value |
|----------|-------|
| Box Size | `16px × 16px` |
| Border | `1.5px solid Gray 400` |
| Border Radius | `4px` |
| Checked Background | `Primary` |
| Checkmark Size | `10px` |
| Label Gap | `8px` |

#### Radio Button

| Property | Value |
|----------|-------|
| Outer Size | `16px × 16px` |
| Inner Dot Size | `6px` |
| Border | `1.5px solid Gray 400` |
| Selected Border | `Primary` |
| Label Gap | `8px` |

#### Toggle Switch

| Property | Value |
|----------|-------|
| Track Width | `36px` |
| Track Height | `20px` |
| Track Border Radius | `10px` |
| Knob Size | `16px` |
| Knob Offset | `2px` |
| Off Track Color | `Gray 300` |
| On Track Color | `Primary` |
| Knob Color | `White` |
| Label Gap | `8px` |

---

### Cards

#### Standard Card

| Property | Value |
|----------|-------|
| Background | `White` |
| Border | `1px solid Gray 200` |
| Border Radius | `8px` |
| Padding | `16px` (compact), `20px` (default), `24px` (spacious) |
| Shadow | `0 1px 3px rgba(0, 0, 0, 0.1)` |
| Hover Shadow | `0 4px 6px rgba(0, 0, 0, 0.1)` (if interactive) |
| Card Gap | `16px` |

#### Card Header

| Property | Value |
|----------|-------|
| Title Font | Heading 3 (`16px`, weight 600) |
| Subtitle Font | Caption (`12px`, Gray 500) |
| Title-to-Subtitle Gap | `4px` |
| Header-to-Content Gap | `16px` |
| Header Bottom Border | `1px solid Gray 100` (optional) |
| Header Padding Bottom | `12px` (if bordered) |

#### Card Variants

**Elevated Card**
- Shadow: `0 4px 12px rgba(0, 0, 0, 0.08)`
- Border: `none`

**Outlined Card**
- Shadow: `none`
- Border: `1px solid Gray 200`

**Interactive Card**
- Cursor: `pointer`
- Transition: `box-shadow 0.15s ease, transform 0.15s ease`
- Hover Transform: `translateY(-2px)`
- Hover Shadow: `0 8px 16px rgba(0, 0, 0, 0.1)`

---

### Tables

#### Table Structure

| Property | Value |
|----------|-------|
| Border Collapse | `separate` |
| Border Spacing | `0` |
| Border | `1px solid Gray 200` |
| Border Radius | `8px` |
| Overflow | `hidden` |

#### Table Header

| Property | Value |
|----------|-------|
| Background | `Gray 50` |
| Font Size | `12px` |
| Font Weight | `600` |
| Text Color | `Gray 600` |
| Text Transform | `uppercase` |
| Letter Spacing | `0.05em` |
| Cell Padding | `12px` |
| Border Bottom | `1px solid Gray 200` |

#### Table Row

| Property | Value |
|----------|-------|
| Background | `White` |
| Hover Background | `Gray 50` |
| Selected Background | `Primary Light` |
| Border Bottom | `1px solid Gray 100` |
| Last Row Border | `none` |
| Transition | `background 0.1s ease` |

#### Table Cell

| Property | Value |
|----------|-------|
| Font Size | `13px` |
| Text Color | `Gray 700` |
| Padding | `10px 12px` |
| Vertical Align | `middle` |
| Min Width | `80px` |

#### Table Actions Column

| Property | Value |
|----------|-------|
| Width | `auto` (fit content) |
| Padding | `8px 12px` |
| Button Gap | `4px` |
| Button Size | `24px × 24px` (icon buttons) |

---

### Modals / Dialogs

#### Modal Overlay

| Property | Value |
|----------|-------|
| Background | `rgba(17, 24, 39, 0.5)` |
| Backdrop Filter | `blur(4px)` |
| Z-Index | `1000` |

#### Modal Container

| Property | Value |
|----------|-------|
| Background | `White` |
| Border Radius | `12px` |
| Shadow | `0 20px 40px rgba(0, 0, 0, 0.15)` |
| Min Width | `400px` |
| Max Width | `560px` (small), `720px` (medium), `960px` (large) |
| Max Height | `85vh` |
| Padding | `0` (header/body/footer have own padding) |

#### Modal Header

| Property | Value |
|----------|-------|
| Padding | `20px 24px` |
| Border Bottom | `1px solid Gray 200` |
| Title Font | Heading 2 (`20px`, weight 600) |
| Close Button Size | `32px × 32px` |
| Close Button Position | `12px` from top and right |

#### Modal Body

| Property | Value |
|----------|-------|
| Padding | `24px` |
| Overflow Y | `auto` |

#### Modal Footer

| Property | Value |
|----------|-------|
| Padding | `16px 24px` |
| Border Top | `1px solid Gray 200` |
| Background | `Gray 50` |
| Button Gap | `12px` |
| Alignment | `flex-end` (right-aligned) |

---

### Dropdown Menus

| Property | Value |
|----------|-------|
| Background | `White` |
| Border | `1px solid Gray 200` |
| Border Radius | `8px` |
| Shadow | `0 10px 24px rgba(0, 0, 0, 0.12)` |
| Min Width | `160px` |
| Max Width | `280px` |
| Padding | `4px 0` |
| Z-Index | `900` |

#### Menu Item

| Property | Value |
|----------|-------|
| Height | `32px` |
| Padding | `0 12px` |
| Font Size | `13px` |
| Font Weight | `400` |
| Text Color | `Gray 700` |
| Icon Size | `16px` |
| Icon-to-Text Gap | `8px` |
| Hover Background | `Gray 100` |
| Active Background | `Gray 200` |
| Disabled Opacity | `0.5` |

#### Menu Divider

| Property | Value |
|----------|-------|
| Height | `1px` |
| Background | `Gray 200` |
| Margin | `4px 0` |

---

### Badges / Tags

#### Badge Sizes

| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| Small | `18px` | `0 6px` | `10px` | `4px` |
| Default | `22px` | `0 8px` | `11px` | `4px` |
| Large | `26px` | `0 10px` | `12px` | `6px` |

#### Badge Variants

| Variant | Background | Text Color | Border |
|---------|------------|------------|--------|
| Default | `Gray 100` | `Gray 700` | `none` |
| Primary | `Primary Light` | `Primary` | `none` |
| Success | `Success Light` | `Success` | `none` |
| Warning | `Warning Light` | `Warning` | `none` |
| Error | `Error Light` | `Error` | `none` |
| Outline | `transparent` | `Gray 600` | `1px solid Gray 300` |

---

### Tooltips

| Property | Value |
|----------|-------|
| Background | `Gray 900` |
| Text Color | `White` |
| Font Size | `12px` |
| Padding | `6px 10px` |
| Border Radius | `6px` |
| Max Width | `240px` |
| Arrow Size | `6px` |
| Offset from Trigger | `8px` |
| Z-Index | `1100` |

---

### Notifications / Toasts

| Property | Value |
|----------|-------|
| Width | `360px` |
| Padding | `12px 16px` |
| Border Radius | `8px` |
| Shadow | `0 8px 24px rgba(0, 0, 0, 0.15)` |
| Icon Size | `20px` |
| Icon-to-Content Gap | `12px` |
| Title Font | `14px`, weight 600 |
| Message Font | `13px`, weight 400 |
| Position | `16px` from top-right corner |
| Stack Gap | `8px` |
| Z-Index | `1200` |

---

### Sidebar Navigation

#### Sidebar Container

| Property | Value |
|----------|-------|
| Width Expanded | `240px` |
| Width Collapsed | `64px` |
| Background | `White` |
| Border Right | `1px solid Gray 200` |
| Padding | `16px 12px` |

#### Nav Item

| Property | Value |
|----------|-------|
| Height | `36px` |
| Padding | `0 12px` |
| Border Radius | `6px` |
| Font Size | `14px` |
| Font Weight | `500` |
| Icon Size | `18px` |
| Icon-to-Text Gap | `10px` |
| Text Color | `Gray 600` |
| Hover Background | `Gray 100` |
| Active Background | `Primary Light` |
| Active Text Color | `Primary` |
| Active Icon Color | `Primary` |
| Item Gap | `4px` |

#### Nav Section

| Property | Value |
|----------|-------|
| Section Title Font | `11px`, weight 600 |
| Section Title Color | `Gray 400` |
| Section Title Transform | `uppercase` |
| Section Title Letter Spacing | `0.05em` |
| Section Title Padding | `8px 12px` |
| Section Gap | `24px` |

---

### Pagination

| Property | Value |
|----------|-------|
| Button Size | `32px × 32px` |
| Button Border Radius | `6px` |
| Button Gap | `4px` |
| Font Size | `13px` |
| Current Page Background | `Primary` |
| Current Page Text | `White` |
| Other Pages Background | `transparent` |
| Hover Background | `Gray 100` |
| Disabled Opacity | `0.4` |

---

### Progress Indicators

#### Progress Bar

| Property | Value |
|----------|-------|
| Track Height | `4px` (small), `6px` (default), `8px` (large) |
| Track Background | `Gray 200` |
| Track Border Radius | `Full (9999px)` |
| Fill Background | `Primary` |
| Fill Border Radius | `Full (9999px)` |

#### Spinner

| Property | Value |
|----------|-------|
| Size Small | `16px` |
| Size Default | `24px` |
| Size Large | `32px` |
| Border Width | `2px` |
| Track Color | `Gray 200` |
| Active Color | `Primary` |
| Animation Duration | `0.75s` |

---

### Avatar

| Size | Dimensions | Font Size | Border Radius |
|------|------------|-----------|---------------|
| XS | `24px` | `10px` | `Full` |
| Small | `32px` | `12px` | `Full` |
| Default | `40px` | `14px` | `Full` |
| Large | `48px` | `16px` | `Full` |
| XL | `64px` | `20px` | `Full` |

| Property | Value |
|----------|-------|
| Background (no image) | `Primary Light` |
| Text Color (initials) | `Primary` |
| Border | `2px solid White` (when stacked) |
| Stack Overlap | `-8px` margin |

---

### Breadcrumbs

| Property | Value |
|----------|-------|
| Font Size | `13px` |
| Text Color | `Gray 500` |
| Active Text Color | `Gray 900` |
| Separator | `/` or `chevron icon` |
| Separator Color | `Gray 400` |
| Separator Margin | `0 8px` |
| Link Hover Color | `Primary` |

---

### Tabs

#### Tab Container

| Property | Value |
|----------|-------|
| Border Bottom | `1px solid Gray 200` |
| Background | `transparent` |

#### Tab Item

| Property | Value |
|----------|-------|
| Height | `40px` |
| Padding | `0 16px` |
| Font Size | `14px` |
| Font Weight | `500` |
| Text Color | `Gray 500` |
| Hover Text Color | `Gray 700` |
| Active Text Color | `Gray 900` |
| Active Indicator Height | `2px` |
| Active Indicator Color | `Primary` |
| Active Indicator Position | `bottom` |
| Tab Gap | `0` |

---

## Icons

### Icon Library

**Recommended**: Heroicons, Lucide, or Phosphor Icons

### Icon Sizes

| Name | Size | Usage |
|------|------|-------|
| XS | `12px` | Badges, tags, tight spaces |
| Small | `14px` | Inline with small text |
| Default | `16px` | Buttons, inputs, general use |
| Medium | `18px` | Navigation items |
| Large | `20px` | Card headers, emphasis |
| XL | `24px` | Feature icons, empty states |
| XXL | `32px` | Hero sections, illustrations |

### Icon Colors

| Context | Color |
|---------|-------|
| Default | `Gray 500` |
| Interactive | `Gray 600` |
| Hover | `Gray 800` |
| Active | `Primary` |
| Disabled | `Gray 300` |
| Success | `Success` |
| Warning | `Warning` |
| Error | `Error` |

### Icon-to-Text Spacing

| Icon Size | Gap |
|-----------|-----|
| 12-14px | `4px` |
| 16px | `6px` |
| 18-20px | `8px` |
| 24px+ | `10px` |

---

## Shadows & Elevation

### Shadow Scale

| Level | Shadow | Usage |
|-------|--------|-------|
| None | `none` | Flat elements |
| XS | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle lift |
| SM | `0 1px 3px rgba(0, 0, 0, 0.1)` | Cards, buttons |
| MD | `0 4px 6px rgba(0, 0, 0, 0.1)` | Hover states |
| LG | `0 10px 15px rgba(0, 0, 0, 0.1)` | Dropdowns |
| XL | `0 20px 25px rgba(0, 0, 0, 0.1)` | Modals |
| 2XL | `0 25px 50px rgba(0, 0, 0, 0.15)` | Overlays |

### Elevation Layers

| Layer | Z-Index | Examples |
|-------|---------|----------|
| Base | `0` | Page content |
| Raised | `100` | Cards with elevation |
| Sticky | `200` | Sticky headers |
| Dropdown | `900` | Menus, popovers |
| Modal | `1000` | Modal dialogs |
| Tooltip | `1100` | Tooltips |
| Notification | `1200` | Toasts, alerts |

---

## Borders & Dividers

### Border Widths

| Name | Width | Usage |
|------|-------|-------|
| Default | `1px` | Standard borders |
| Medium | `2px` | Active indicators, focus rings |
| Thick | `3px` | Strong emphasis |

### Border Radius Scale

| Name | Radius | Usage |
|------|--------|-------|
| None | `0px` | Sharp corners |
| SM | `4px` | Small elements, badges |
| Default | `6px` | Buttons, inputs |
| MD | `8px` | Cards, modals |
| LG | `12px` | Large cards, panels |
| XL | `16px` | Feature cards |
| Full | `9999px` | Pills, avatars |

### Dividers

| Property | Value |
|----------|-------|
| Height | `1px` |
| Color | `Gray 200` |
| Margin | `16px 0` (horizontal), `0 12px` (vertical) |

---

## Animation & Transitions

### Duration Scale

| Name | Duration | Usage |
|------|----------|-------|
| Instant | `0ms` | No animation |
| Fast | `100ms` | Micro-interactions |
| Normal | `150ms` | Standard transitions |
| Moderate | `200ms` | Expanding elements |
| Slow | `300ms` | Page transitions |
| Slower | `500ms` | Complex animations |

### Easing Functions

| Name | Value | Usage |
|------|-------|-------|
| Ease Out | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering |
| Ease In | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting |
| Ease In Out | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy effects |

### Common Transitions

```css
/* Button hover */
transition: background-color 100ms ease-out, box-shadow 100ms ease-out;

/* Card hover */
transition: transform 150ms ease-out, box-shadow 150ms ease-out;

/* Modal enter */
transition: opacity 200ms ease-out, transform 200ms ease-out;

/* Dropdown */
transition: opacity 150ms ease-out, transform 150ms ease-out;

/* Color change */
transition: color 100ms ease-out;
```

---

## Responsive Breakpoints

| Name | Min Width | Max Width | Target |
|------|-----------|-----------|--------|
| Mobile | `0px` | `639px` | Phones |
| Tablet | `640px` | `1023px` | Tablets |
| Desktop | `1024px` | `1279px` | Laptops |
| Wide | `1280px` | `1535px` | Monitors |
| Ultra Wide | `1536px` | `∞` | Large displays |

### Desktop-First Considerations

Since this is a desktop management UI:
- **Minimum supported width**: `1024px`
- **Optimal experience**: `1280px - 1920px`
- **Maximum content width**: `1440px` (centered on larger screens)

---

## Accessibility

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | `4.5:1` |
| Large text (18px+) | `3:1` |
| UI components | `3:1` |
| Focus indicators | `3:1` |

### Focus States

| Property | Value |
|----------|-------|
| Focus Ring Color | `Primary` |
| Focus Ring Width | `2px` |
| Focus Ring Offset | `2px` |
| Focus Ring Style | `solid` |
| Focus Shadow | `0 0 0 3px Primary Light` |

### Interactive Element Sizes

| Element | Minimum Size |
|---------|--------------|
| Click targets | `32px × 32px` |
| Touch targets (if mobile) | `44px × 44px` |
| Button min-width | `64px` |

### Keyboard Navigation

- All interactive elements must be focusable
- Focus order follows logical reading order
- Focus indicators must be visible
- Escape closes modals and dropdowns
- Enter/Space activates buttons and links

---

## Implementation Notes

### CSS Variables Example

```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-light: #DBEAFE;
  --color-gray-900: #111827;
  --color-gray-700: #374151;
  --color-gray-500: #6B7280;
  --color-gray-400: #9CA3AF;
  --color-gray-200: #E5E7EB;
  --color-gray-100: #F3F4F6;
  --color-gray-50: #F9FAFB;
  
  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-md: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-normal: 150ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

---

## Quick Reference

### Button Specifications (Desktop-Optimized)

| Button Type | Height | Font Size | Padding H | Padding V | Radius |
|-------------|--------|-----------|-----------|-----------|--------|
| XS | 24px | 11px | 8px | 4px | 4px |
| Small | 28px | 12px | 12px | 6px | 6px |
| Default | 32px | 13px | 16px | 8px | 6px |
| Large | 40px | 14px | 20px | 10px | 8px |

### Gap Reference

| Context | Gap Value |
|---------|-----------|
| Icon to text | 6px |
| Button to button | 8px |
| Form field to field | 16px |
| Card to card | 16px |
| Section to section | 24px |
| Major sections | 32px |

### Component Heights

| Component | Height |
|-----------|--------|
| Button (default) | 32px |
| Input (default) | 36px |
| Table row | ~40px |
| Nav item | 36px |
| Header bar | 56px |
| Modal header | 64px |

---

*Document Version: 1.0*  
*Last Updated: 2026-04-05*
