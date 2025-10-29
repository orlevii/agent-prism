# Open Playground - Development Guide

## Repository Structure

```
src/
├── components/
│   ├── ui/              # ShadCN UI components (button, input, select, etc.)
│   └── Playground/      # Feature-specific components (ChatInput, MessageBubble, etc.)
├── hooks/               # Custom React hooks (useChat, useSettings, etc.)
├── pages/               # Route pages (Home, About, NotFound)
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions (cn for class merging)
└── utils/               # Helper utilities
```

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS v4** for styling
- **ShadCN UI** for component library
- **React Router** for routing

## Development Best Practices

### TypeScript
- Define explicit types for all component props and function parameters
- Use `interface` for object shapes, `type` for unions/intersections
- Avoid `any` - use `unknown` or proper typing instead
- Keep types co-located in `src/types/` for reusability

### Component Structure
- One component per file, matching the filename
- Props interface defined at the top of each component
- Use ShadCN components instead of building custom UI from scratch
- Keep components focused - split into smaller pieces if they grow large

### State Management
- Use custom hooks for complex state logic (see `useChat`, `useSettings`)
- Keep state as close to where it's used as possible
- Use `useCallback` for functions passed as props to prevent re-renders

### Code Style
- Run `npm run format` before committing (Prettier + ESLint)
- Use semantic naming: `handleClick`, `isLoading`, `onUpdateSetting`
- Prefer functional components and hooks over classes
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer code

### Keep It Simple
- Don't over-engineer - solve the current problem first
- Prefer composition over complex abstractions
- Comment only when the "why" isn't obvious from the code
- Delete unused code immediately - don't comment it out

### API Integration
- All API calls go through custom hooks (e.g., `useChat`)
- Handle loading, error, and success states explicitly
- Use TypeScript interfaces for API request/response shapes
- Always validate and sanitize external data

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run format       # Format code with Prettier + fix lint issues
npm run lint         # Check for linting errors
```

## Adding New Features

1. Define types in `src/types/`
2. Create hooks for state logic in `src/hooks/`
3. Build UI components in `src/components/`
4. Use ShadCN for UI primitives: `npx shadcn@latest add [component]`
5. Format and lint before committing
