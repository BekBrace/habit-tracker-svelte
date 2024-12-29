# HabitFlow - Modern Habit Tracking Application

A keyboard-driven habit tracking application built with modern web technologies. This application demonstrates best practices in web development, including responsive design, accessibility, and efficient state management.

## Technology Stack Explained

### Core Technologies

1. **TypeScript**
   - Superset of JavaScript that adds static typing
   - Benefits:
     - Catch errors during development
     - Better IDE support and autocompletion
     - More maintainable codebase
     - Clear function signatures and interfaces

2. **SvelteKit**
   - Modern meta-framework built on top of Svelte
   - Benefits:
     - Extremely fast performance
     - Small bundle sizes
     - Intuitive reactivity system
     - Built-in routing
     - Server-side rendering capabilities
   - Key Features Used:
     - File-based routing
     - Component-based architecture
     - Reactive statements
     - Lifecycle methods (onMount)

3. **Tailwind CSS**
   - Utility-first CSS framework
   - Benefits:
     - Rapid UI development
     - Consistent design system
     - Small production bundle size
     - Dark mode support
   - Key Features Used:
     - Responsive design utilities
     - Flexbox and Grid systems
     - Dark mode classes
     - Transitions and animations

### State Management

1. **Local Storage**
   - Browser's built-in storage system
   - Used for:
     - Storing habits data
     - Tracking completion history
     - Persisting user preferences
   - Implementation:
     - Custom wrapper in `src/lib/db/index.ts`
     - TypeScript interfaces for type safety
     - JSON serialization for data storage

### Project Structure

```
habitflow/
├── src/
│   ├── lib/
│   │   └── db/           # Database service
│   │       └── index.ts  # localStorage wrapper
│   ├── routes/
│   │   ├── +layout.svelte  # Root layout
│   │   └── +page.svelte    # Main application page
│   ├── app.html          # HTML template
│   └── app.css          # Global styles
├── static/              # Static assets
├── package.json        # Dependencies
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts    # Vite configuration
└── tailwind.config.js # Tailwind configuration
```

## Features in Detail

### 1. Keyboard Navigation
- Vim-style shortcuts (j/k for navigation)
- Space to toggle habits
- Quick add/delete with 'n' and 'd'
- Escape to cancel actions

### 2. Data Persistence
- Habits stored in localStorage
- Daily completion tracking
- Statistics calculation
- Data structure:
  ```typescript
  interface Habit {
    id: number;
    name: string;
    frequency: string;
    created_at: string;
  }
  ```

### 3. User Interface
- Clean, minimal design
- Dark mode support
- Responsive layout
- Visual feedback for actions
- Accessible form controls

## Development Workflow

1. **Setup Environment**
   ```bash
   # Install Node.js v18 or later
   # Install pnpm package manager
   npm install -g pnpm
   ```

2. **Install Dependencies**
   ```bash
   cd habitflow
   pnpm install
   ```

3. **Development Server**
   ```bash
   pnpm dev
   ```
   - Hot module replacement
   - Fast refresh
   - Development tools

4. **Building for Production**
   ```bash
   pnpm build
   ```
   - Optimized assets
   - Minified code
   - Production-ready bundle

## Best Practices Implemented

1. **TypeScript Best Practices**
   - Interface-based design
   - Strict type checking
   - Proper error handling
   - Clear type definitions

2. **Svelte Best Practices**
   - Reactive declarations
   - Proper lifecycle management
   - Event handling patterns
   - Component composition

3. **CSS Best Practices**
   - Mobile-first design
   - Dark mode support
   - Consistent spacing
   - Accessible color contrast

4. **Performance Optimizations**
   - Efficient state updates
   - Minimal re-renders
   - Lazy loading
   - Local storage caching

## Architecture Decisions

1. **Why SvelteKit?**
   - Excellent developer experience
   - Small bundle size
   - Built-in routing
   - Strong TypeScript support

2. **Why Tailwind CSS?**
   - Utility-first approach speeds development
   - Built-in dark mode
   - Easy responsive design
   - No CSS conflicts

3. **Why localStorage?**
   - Simple to implement
   - No backend required
   - Instant operations
   - Offline support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### Common Issues

1. **pnpm not found**
   ```bash
   npm install -g pnpm
   ```

2. **Development server issues**
   ```bash
   # Clear dependencies and reinstall
   rm -rf node_modules
   pnpm install
   ```

3. **TypeScript errors**
   - Check `tsconfig.json` settings
   - Ensure proper type definitions
   - Run `pnpm check` for type checking

## Future Enhancements

1. **Planned Features**
   - Habit streaks
   - Weekly/monthly views
   - Data export/import
   - Cloud sync

2. **Technical Improvements**
   - Migration to IndexedDB
   - PWA support
   - Unit tests
   - E2E tests

## Learning Resources

1. **Svelte/SvelteKit**
   - [Svelte Tutorial](https://svelte.dev/tutorial)
   - [SvelteKit Documentation](https://kit.svelte.dev/docs)

2. **TypeScript**
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
   - [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

3. **Tailwind CSS**
   - [Tailwind Documentation](https://tailwindcss.com/docs)
   - [Tailwind UI Components](https://tailwindui.com/)
