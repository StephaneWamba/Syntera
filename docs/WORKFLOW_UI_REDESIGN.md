# Workflow Builder UI/UX Redesign Proposal

## Design Goals
1. **More Compact**: Reduce visual clutter with smaller, denser node items
2. **Better Organization**: Clearer visual hierarchy and grouping
3. **Modern Aesthetics**: Replace heavy cards with lighter, button-style elements
4. **Theme-Aware**: Mini map adapts to dark/light theme
5. **Improved UX**: Faster scanning and selection

## Proposed Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Toolbar: Name | Description | Cancel | Test | Save]          │
├──────────┬──────────────────────────────────────────┬──────────┤
│          │                                          │          │
│ SIDEBAR  │         CANVAS AREA                      │  CONFIG  │
│          │                                          │  PANEL   │
│ Search   │  [React Flow Canvas]                     │  (when   │
│ ──────── │                                          │  node    │
│          │  [Workflow Nodes & Connections]          │  selected)│
│ TRIGGERS │                                          │          │
│ ──────── │  [Mini Map: Bottom Right]                │          │
│ ⚡ Item  │  [Controls: Bottom Left]                 │          │
│ 💬 Item  │                                          │          │
│ 👤 Item  │                                          │          │
│          │                                          │          │
│ CONDITIONS│                                         │          │
│ ──────── │                                          │          │
│ ❓ Item  │                                          │          │
│          │                                          │          │
│ ACTIONS  │                                          │          │
│ ──────── │                                          │          │
│ 💼 Item  │                                          │          │
│ 👤 Item  │                                          │          │
│ 🏷️ Item  │                                          │          │
│          │                                          │          │
└──────────┴──────────────────────────────────────────┴──────────┘
```

## Design Changes

### 1. Sidebar Node Items (Replace Cards)
**Current**: Large Card components with icon, title, and description
**Proposed**: Compact button-style items with:
- Smaller height (py-2 instead of p-3)
- Icon + label only (description on hover tooltip)
- Subtle hover effect
- Border-left accent color by category
- More items visible without scrolling

### 2. Visual Hierarchy
- **Section Headers**: Smaller, uppercase, with subtle divider
- **Node Items**: Compact list items with icon + text
- **Spacing**: Reduced padding (p-2 instead of p-4)
- **Width**: Narrower sidebar (w-56 instead of w-64)

### 3. Node Item Design
```
┌─────────────────────────┐
│ ⚡ Purchase Intent       │  ← Compact, icon + label
└─────────────────────────┘
```

Instead of:
```
┌─────────────────────────────┐
│ ⚡ Purchase Intent           │
│    Triggered when purchase  │  ← Too much space
│    intent is detected        │
└─────────────────────────────┘
```

### 4. Theme-Aware Mini Map
- Use CSS variables for colors
- Dark theme: Dark background, light nodes
- Light theme: Light background, dark nodes
- Match canvas background color

### 5. Improved Toolbar
- More compact layout
- Better spacing
- Clearer visual separation

## Implementation Plan
1. Redesign NodePalette with compact items
2. Update MiniMap styling for theme awareness
3. Adjust spacing and sizing throughout
4. Add hover tooltips for descriptions
5. Improve visual hierarchy




