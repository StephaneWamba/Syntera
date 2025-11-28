# Why It's Difficult - Build Errors Explained

## The Core Problem

**React Hooks Cannot Be Lazy Loaded**

The landing page (`app/page.tsx`) uses Framer Motion hooks:
- `useScroll()` - tracks scroll position
- `useTransform()` - transforms scroll values

**Why this is a problem:**
```typescript
// ❌ This CANNOT work:
const useScroll = dynamic(() => import("framer-motion").then(mod => mod.useScroll))

// React hooks MUST be:
// 1. Called at the top level of a component
// 2. Called unconditionally (not inside if statements)
// 3. Called in the same order every render
```

**The issue:** Hooks are runtime functions, not components. You can't dynamically import and use them.

## Simple Solution

For the **landing page**, just import Framer Motion normally:

```typescript
// ✅ Simple solution - just import it
import { motion } from 'framer-motion'
```

**Why this is OK:**
- Landing page is public (not in dashboard critical path)
- Users only load it once when visiting the site
- ~50KB is acceptable for a marketing page
- Animations are important for landing pages

**Dashboard pages** are already optimized with lazy loading ✅

## What We've Done

✅ Fixed missing dependency (`@emotion/is-prop-valid`)
✅ Fixed component name typos
✅ Lazy loaded Framer Motion in dashboard pages (where it matters)

## What's Left

The landing page still needs Framer Motion imported normally because it uses hooks.

**Recommendation:** Keep it simple - just import `motion` normally for the landing page.
