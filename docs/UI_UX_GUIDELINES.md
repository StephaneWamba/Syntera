# Syntera - UI/UX Guidelines & Best Practices

## Overview

This document outlines the design system, UI/UX best practices, and implementation guidelines for Syntera's modern SaaS interface.

---

## Design Philosophy

### Core Principles

1. **Performance First**: Every UI decision prioritizes speed and responsiveness
2. **Accessibility**: WCAG AA compliance for all users
3. **Consistency**: Unified design language across all features
4. **Clarity**: Clear visual hierarchy and intuitive interactions
5. **Modern Aesthetics**: Clean, professional, and contemporary design

### Design Inspiration

- **Linear**: Clean, fast, minimal - excellent for productivity tools
- **Vercel**: Modern, polished, developer-friendly
- **Stripe**: Professional, trustworthy, conversion-focused
- **Cal.com**: Functional, beautiful, user-centric

---

## Tech Stack

### Core Framework
- **Next.js 14+** (App Router) - SSR, optimization, routing
- **React 18.3+** - Component architecture, concurrent features

### UI Foundation
- **Shadcn/ui** - Copy-paste components, full customization
- **TailwindCSS 3.4+** - Utility-first styling, responsive design
- **Radix UI** - Accessible headless primitives

### Enhanced Libraries

```json
{
  // Animation & Micro-interactions
  "framer-motion": "^10.16.0",        // Smooth animations
  "@react-spring/web": "^9.7.0",      // Physics-based animations (optional)
  
  // Icons
  "lucide-react": "^0.300.0",         // Beautiful icon set (Shadcn standard)
  "@radix-ui/react-icons": "^1.3.0",  // Additional Radix icons
  
  // Data Tables (SaaS essential)
  "@tanstack/react-table": "^8.10.0", // Powerful table component
  
  // Command Palette (Modern SaaS feature)
  "cmdk": "^0.2.0",                    // Command menu (⌘K)
  
  // Toast Notifications
  "sonner": "^1.2.0",                  // Beautiful toast notifications
  
  // Loading States
  "react-loading-skeleton": "^3.3.0",  // Skeleton loaders
  
  // Date/Time
  "date-fns": "^2.30.0",              // Date utilities
  "react-day-picker": "^8.9.0",       // Date picker component
}
```

---

## Design System

### Color Palette

```typescript
// lib/design-system/colors.ts
export const colors = {
  // Brand Colors
  brand: {
    primary: '#6366f1',    // Indigo - Modern, professional
    secondary: '#8b5cf6',  // Purple - Creative, innovative
    accent: '#ec4899',     // Pink - Energetic, friendly
  },
  
  // Semantic Colors
  semantic: {
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Amber
    error: '#ef4444',      // Red
    info: '#3b82f6',       // Blue
  },
  
  // Neutral Scale (for dark mode compatibility)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  }
}
```

### Typography

```typescript
// lib/design-system/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  scale: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
}
```

### Spacing System

Using Tailwind's default spacing scale (0.25rem increments):
- `0` = 0px
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `4` = 1rem (16px)
- `8` = 2rem (32px)
- `16` = 4rem (64px)

### Border Radius

```typescript
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
}
```

### Shadows

```typescript
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
}
```

---

## Component Architecture

### Folder Structure

```
components/
├── ui/                    # Shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   └── ...
│
├── layout/                 # Layout components
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── dashboard-layout.tsx
│   ├── auth-layout.tsx
│   └── navigation.tsx
│
├── features/               # Feature-specific components
│   ├── agent/
│   │   ├── agent-card.tsx
│   │   ├── agent-config.tsx
│   │   └── agent-list.tsx
│   ├── chat/
│   │   ├── chat-window.tsx
│   │   ├── message-bubble.tsx
│   │   └── chat-input.tsx
│   ├── crm/
│   │   ├── contact-card.tsx
│   │   ├── deal-pipeline.tsx
│   │   └── contact-form.tsx
│   └── analytics/
│       ├── metric-card.tsx
│       ├── chart-container.tsx
│       └── dashboard-grid.tsx
│
├── shared/                 # Shared components
│   ├── loading/
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   └── loading-overlay.tsx
│   ├── error/
│   │   ├── error-boundary.tsx
│   │   ├── error-message.tsx
│   │   └── not-found.tsx
│   ├── empty-state.tsx
│   ├── command-palette.tsx
│   └── toast-provider.tsx
│
└── providers/              # Context providers
    ├── theme-provider.tsx
    ├── query-provider.tsx
    └── auth-provider.tsx
```

---

## Modern SaaS UI Patterns

### 1. Command Palette (⌘K)

**Purpose**: Quick navigation and actions

**Implementation**:
- Use `cmdk` library
- Keyboard shortcut: `Cmd/Ctrl + K`
- Search across: Pages, Actions, Recent items
- Fuzzy search support

**Example**:
```typescript
// components/shared/command-palette.tsx
import { Command } from 'cmdk'

export function CommandPalette() {
  return (
    <Command>
      <Command.Input placeholder="Type a command or search..." />
      <Command.List>
        <Command.Group heading="Navigation">
          <Command.Item>Dashboard</Command.Item>
          <Command.Item>Agents</Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  )
}
```

### 2. Skeleton Loaders

**Purpose**: Better perceived performance

**Implementation**:
- Use `react-loading-skeleton`
- Show skeleton for initial load
- Match actual content layout
- Smooth fade-in transition

**Best Practices**:
- Show skeleton immediately (no delay)
- Match content dimensions
- Use subtle animation
- Replace with content when ready

### 3. Optimistic Updates

**Purpose**: Instant user feedback

**Implementation**:
- Update UI immediately
- Show loading state
- Rollback on error
- Use React Query mutations

**Example**:
```typescript
const mutation = useMutation({
  mutationFn: updateContact,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['contacts'])
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['contacts'])
    
    // Optimistically update
    queryClient.setQueryData(['contacts'], (old) => ({
      ...old,
      ...newData
    }))
    
    return { previous }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['contacts'], context.previous)
  },
})
```

### 4. Toast Notifications

**Purpose**: Non-intrusive feedback

**Implementation**:
- Use `sonner` library
- Position: Top-right (desktop), Bottom-center (mobile)
- Auto-dismiss: 3-5 seconds
- Action buttons for important toasts

**Types**:
- Success (green)
- Error (red)
- Warning (amber)
- Info (blue)

### 5. Data Tables

**Purpose**: Display and manage large datasets

**Implementation**:
- Use `@tanstack/react-table`
- Features: Sorting, filtering, pagination, selection
- Responsive: Stack on mobile
- Loading states: Skeleton rows

**Best Practices**:
- Virtual scrolling for 1000+ rows
- Column resizing
- Export functionality
- Bulk actions

### 6. Empty States

**Purpose**: Guide users when no data exists

**Components**:
- Icon/Illustration
- Heading
- Description
- Primary action button
- Secondary action (optional)

**Example**:
```typescript
<EmptyState
  icon={Users}
  title="No contacts yet"
  description="Get started by adding your first contact"
  action={<Button>Add Contact</Button>}
/>
```

### 7. Onboarding Flows

**Purpose**: Guide new users

**Implementation**:
- Multi-step wizard
- Progress indicator
- Skip option
- Save progress
- Tooltips for first-time features

---

## Performance Best Practices

### 1. Code Splitting

**Strategy**:
- Route-based splitting (automatic with App Router)
- Component-based splitting for heavy components
- Dynamic imports for modals, charts, etc.

**Example**:
```typescript
const Chart = dynamic(() => import('./chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

### 2. Image Optimization

**Implementation**:
- Always use Next.js `Image` component
- Provide width/height or use `fill`
- Use `priority` for above-fold images
- Lazy load below-fold images

**Example**:
```typescript
<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
  priority={isAboveFold}
/>
```

### 3. Font Optimization

**Implementation**:
- Use `next/font` for automatic optimization
- Preload critical fonts
- Use `display: swap` for better CLS

**Example**:
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

### 4. Bundle Size

**Strategies**:
- Tree-shaking (automatic with pnpm)
- Analyze bundle with `@next/bundle-analyzer`
- Remove unused dependencies
- Use dynamic imports for heavy libraries

### 5. Lazy Loading

**When to Use**:
- Heavy components (charts, editors)
- Below-fold content
- Modals and dialogs
- Non-critical features

### 6. Virtual Scrolling

**When to Use**:
- Lists with 100+ items
- Tables with many rows
- Long dropdowns

**Library**: `react-window` or `@tanstack/react-virtual`

---

## Accessibility (WCAG AA)

### Requirements

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Skip links for main content
   - Escape key closes modals

2. **Screen Readers**
   - Semantic HTML
   - ARIA labels where needed
   - Alt text for images
   - Form labels

3. **Color Contrast**
   - Text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - Interactive elements: 3:1 minimum

4. **Focus Indicators**
   - Visible focus rings
   - High contrast
   - Consistent styling

### Implementation

- Use Radix UI components (built-in accessibility)
- Test with keyboard only
- Test with screen readers (NVDA, JAWS)
- Use Lighthouse accessibility audit

---

## Responsive Design

### Breakpoints (Tailwind Defaults)

```typescript
{
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}
```

### Mobile-First Approach

1. Design for mobile first
2. Enhance for larger screens
3. Test on real devices
4. Touch targets: Minimum 44x44px

### Responsive Patterns

- **Navigation**: Hamburger menu on mobile, sidebar on desktop
- **Tables**: Stack on mobile, horizontal scroll on tablet
- **Forms**: Full width on mobile, constrained on desktop
- **Cards**: Single column on mobile, grid on desktop

---

## Dark Mode

### Implementation

1. **System Preference Detection**
   ```typescript
   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
   ```

2. **Manual Toggle**
   - User preference stored in localStorage
   - Toggle button in header
   - Smooth transition

3. **Theme Provider**
   ```typescript
   // Use next-themes for easy implementation
   import { ThemeProvider } from 'next-themes'
   ```

### Color Considerations

- Test all colors in both modes
- Ensure contrast ratios maintained
- Use CSS variables for easy switching
- Avoid pure black (#000) - use dark gray

---

## Animation Guidelines

### Principles

1. **Purposeful**: Every animation should have a purpose
2. **Subtle**: Don't distract from content
3. **Fast**: 200-300ms for most interactions
4. **Smooth**: 60fps, use `will-change` sparingly
5. **Respectful**: Honor `prefers-reduced-motion`

### When to Animate

- **Page transitions**: Smooth route changes
- **State changes**: Loading → Content
- **Micro-interactions**: Button hover, card hover
- **Feedback**: Success/error states
- **Navigation**: Sidebar open/close

### Implementation

```typescript
// Respect reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// Framer Motion example
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="..."
>
  {content}
</motion.div>
```

---

## Error Handling

### Error States

1. **Inline Errors**: Form validation
2. **Toast Notifications**: Action feedback
3. **Error Pages**: 404, 500, etc.
4. **Error Boundaries**: React error boundaries

### Best Practices

- Clear error messages
- Actionable solutions
- Retry mechanisms
- Logging for debugging

---

## Loading States

### Types

1. **Skeleton Loaders**: Initial page load
2. **Spinners**: Quick actions (< 1s)
3. **Progress Bars**: Long operations
4. **Skeletons**: Data fetching

### Best Practices

- Show immediately (no delay)
- Match content layout
- Smooth transitions
- Clear what's loading

---

## Form Best Practices

### Validation

- Real-time validation (on blur)
- Clear error messages
- Success indicators
- Disable submit until valid

### UX

- Auto-focus first field
- Logical tab order
- Clear labels
- Helpful placeholder text
- Required field indicators

### Implementation

- React Hook Form for performance
- Zod for validation
- Shadcn/ui form components

---

## Testing Checklist

### Visual Testing

- [ ] All breakpoints tested
- [ ] Dark mode tested
- [ ] High contrast mode tested
- [ ] Different screen sizes
- [ ] Different browsers

### Functional Testing

- [ ] All interactions work
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Form validation
- [ ] Error handling

### Performance Testing

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size optimized
- [ ] Images optimized

---

## Component Development Guidelines

### 1. Component Structure

```typescript
// 1. Imports
import { ... } from '...'

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ ... }: ComponentProps) {
  // 4. Hooks
  // 5. Handlers
  // 6. Render
  return (...)
}
```

### 2. Props Naming

- Use descriptive names
- Boolean props: `is*`, `has*`, `should*`
- Event handlers: `on*`
- Callbacks: `on*`

### 3. Composition

- Prefer composition over props drilling
- Use compound components where appropriate
- Keep components focused and small

### 4. Reusability

- Extract common patterns
- Create shared components
- Use variants for different states
- Document component API

---

## Code Quality Standards

### TypeScript

- Strict mode enabled
- No `any` types
- Proper type definitions
- Type inference where possible

### ESLint/Prettier

- Consistent formatting
- No console.logs in production
- Proper error handling
- Clean code principles

### Performance

- Memoize expensive computations
- Use React.memo for pure components
- Optimize re-renders
- Lazy load when appropriate

---

## Resources

### Design Inspiration

- [Linear](https://linear.app)
- [Vercel](https://vercel.com)
- [Stripe](https://stripe.com)
- [Cal.com](https://cal.com)
- [Shadcn/ui Examples](https://ui.shadcn.com/examples)

### Documentation

- [Shadcn/ui Docs](https://ui.shadcn.com)
- [Radix UI Docs](https://www.radix-ui.com)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Framer Motion Docs](https://www.framer.com/motion)

### Tools

- [Figma](https://figma.com) - Design
- [Storybook](https://storybook.js.org) - Component development
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance
- [WAVE](https://wave.webaim.org) - Accessibility

---

## Conclusion

This guide provides the foundation for building a modern, performant, and accessible SaaS UI. Follow these guidelines consistently to ensure a cohesive user experience across all features.

**Remember**: Great UI/UX is not just about aesthetics—it's about making users productive and happy.

