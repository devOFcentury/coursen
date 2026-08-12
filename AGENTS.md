# AI Agent Guidelines for Coursen

This document guides AI coding agents working in the Coursen codebase. It establishes project conventions, development standards, and optimization strategies.

## Project Overview

**Coursen** is an Angular 22.1+ application with:
- Server-side rendering (SSR) enabled
- Standalone components (no NgModules)
- Signal-based state management
- TypeScript 6.0.2 with strict type checking
- Vitest for unit testing
- SCSS for styling
- Prettier for code formatting

See [README.md](README.md) for build, development, and testing commands.

## Core Development Standards

### TypeScript

- **Strict type checking is enforced.** Do not disable type checks or use `any`. Use `unknown` when the type is genuinely uncertain.
- **Prefer type inference** when types are obvious from context.
- **Never disable strict options** in `tsconfig.json`. Respect: `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `isolatedModules`.

### Angular Components & Standalone Architecture

- **All components are standalone.** Do not create NgModules.
- **Use `input()` and `output()` Signal functions** instead of `@Input` and `@Output` decorators:
  ```typescript
  // ✓ Correct
  readonly count = input<number>(0);
  readonly countChange = output<number>();
  
  // ✗ Avoid
  @Input() count: number = 0;
  @Output() countChange = new EventEmitter<number>();
  ```
- **Use `model()` for two-way bindings** (`[(prop)]` syntax) instead of pairing `input()` with `output()`.
- **Import dependencies via the `imports` array** in the `@Component` decorator.
- **Use inline templates and styles** for small, focused components. Use `templateUrl` and `styleUrl` with paths relative to the component TS file for larger ones.
- **Host bindings must go inside the `host` object** of the `@Component` decorator, not via `@HostBinding`/`@HostListener` decorators:
  ```typescript
  @Component({
    selector: 'app-button',
    host: {
      'class': 'app-button',
      '[attr.aria-label]': 'ariaLabel'
    }
  })
  ```

### State Management

- **Use signals for all local component state:**
  ```typescript
  count = signal(0);
  isOpen = signal(false);
  ```
- **Use `computed()` for derived state** (values computed from other signals):
  ```typescript
  doubled = computed(() => this.count() * 2);
  ```
- **Use `linkedSignal()` when state must stay synchronized across multiple reactive sources.**
- **Update signals with `set()` or `update()`, never `mutate()`:**
  ```typescript
  this.count.set(10);
  this.count.update(val => val + 1);
  ```

### Forms

- **Prefer Signal Forms (`@angular/forms/signals`)** for new forms. They provide signal-based state, type-safe field access, and schema validation (stable in Angular 22+).
- **Fallback to Reactive Forms** if Signal Forms don't fit the use case. Never use Template-driven forms for new code.

### Templates & Bindings

- **Use native control flow** (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Use class/style bindings** instead of `ngClass`/`ngStyle`:
  ```typescript
  // ✓ Correct
  [class.active]="isActive()"
  [style.width.px]="width()"
  
  // ✗ Avoid
  [ngClass]="{ active: isActive() }"
  [ngStyle]="{ width: width() + 'px' }"
  ```
- **Use the async pipe** to handle observables in templates. Never assume globals like `new Date()` are available (SSR compatibility).

### Images

- **Use `NgOptimizedImage`** for all static images (provides lazy loading, format selection, srcset).
- Note: `NgOptimizedImage` does not work with inline base64 images.

### Services

- **Design services around a single responsibility** (the Service pattern).
- **Use the `@Service` decorator** (Angular 22+) for singleton services. This replaces `@Injectable({ providedIn: 'root' })`.
  ```typescript
  @Service({ providedIn: 'root' })
  export class DataService { }
  ```
- **Use `inject()` function** instead of constructor injection for dependencies.

### Routing

- **Leverage `Routes` API** for type-safe routing configuration (defined in `app.routes.ts`).
- **Implement lazy loading** for feature routes to optimize bundle size and initial load performance.
- **Use route guards** to protect private routes and manage access control.

### Server-Side Rendering (SSR)

- **Always consider SSR compatibility** when writing code:
  - Do not access `window`, `document`, or `navigator` directly. Use Angular's `PLATFORM_ID` and `isPlatformBrowser()` to guard browser-only code.
  - Do not use globals like `new Date()` without considering server execution context.
  - Fetch data during route activation via resolvers or in component constructors, not in effects.
- Configuration files: [app.config.ts](src/app/app.config.ts), [app.config.server.ts](src/app/app.config.server.ts).

### Styling

- **SCSS is the primary stylesheet language.** Use CSS variables for theming and design tokens.
- **Scope styles to components** using `styleUrl` to avoid global pollution.
- **Prefer Sass features** (variables, mixins, nesting) for maintainability.

## Accessibility & Quality Assurance

- **All components must pass AXE accessibility checks** (no errors or violations).
- **WCAG AA compliance is mandatory:**
  - Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text).
  - Implement proper focus management for keyboard navigation.
  - Use semantic HTML and ARIA attributes where appropriate.
  - Test with screen readers.

## Testing

- **Use Vitest** for unit tests (configured in the project).
- **Test file naming:** `*.spec.ts` (e.g., `app.spec.ts`).
- **Structure tests** to verify component behavior, state transitions, and accessibility requirements.

## Code Quality

- **Format code with Prettier** (pre-configured in the project). Run: `npm run build` or IDE autoformat.
- **Follow naming conventions:**
  - Components: PascalCase class names with `Component` suffix (e.g., `UserListComponent`).
  - Services: PascalCase class names with `Service` suffix (e.g., `UserService`).
  - Properties/methods: camelCase.
  - Constants: UPPER_SNAKE_CASE.
  - Private fields/methods: prefix with `#` (private field syntax).
  - Protected members: prefix with `protected`.

## Build & Deployment Commands

```bash
ng serve                    # Start dev server (http://localhost:4200)
ng build                    # Production build
ng test                     # Run unit tests with Vitest
npm run serve:ssr:coursen   # Run SSR server locally
```

## Key Files & Patterns

| File | Purpose |
|------|---------|
| [src/app/app.ts](src/app/app.ts) | Root component (standalone) |
| [src/app/app.routes.ts](src/app/app.routes.ts) | Route configuration |
| [src/app/app.config.ts](src/app/app.config.ts) | App configuration (client) |
| [src/app/app.config.server.ts](src/app/app.config.server.ts) | App configuration (server) |
| [src/main.ts](src/main.ts) | Browser bootstrap |
| [src/main.server.ts](src/main.server.ts) | Server bootstrap |

## Common Development Patterns

### Creating a Standalone Component

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-counter',
  imports: [],
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `
})
export class CounterComponent {
  count = input<number>(0);
  countChange = output<number>();

  increment(): void {
    this.countChange.emit(this.count() + 1);
  }
}
```

### Creating a Service

```typescript
import { Service } from '@angular/core';

@Service({ providedIn: 'root' })
export class DataService {
  getData() {
    // Implementation
  }
}
```

### Component with State & Computed Values

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  template: `<p>{{ fullName() }}</p>`
})
export class UserProfileComponent {
  firstName = signal('John');
  lastName = signal('Doe');

  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}
```

---

**Last Updated:** 2026-08-12  
**Maintainers:** Follow this guide to maintain consistency and quality across the Coursen codebase.
