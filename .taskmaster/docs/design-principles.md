# 🌐 Web App Design Principles (React + Tailwind + Next.js, AI-Assisted)

These guidelines are intended for projects where **Claude Code** is used for AI-assisted development and **Playwright MCP servers** are used for testing and validation.

---

## 🔑 Quick Reference (One-Liners)

- **UX & Accessibility** → Semantic HTML, clear states, keyboard-first.
- **Consistency & Design System** → Tokenize everything; use variants, not forks.
- **Visual Hierarchy** → Important things should _look_ important; whitespace is signal, not wasted space.
- **Performance** → Core Web Vitals budgets (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- **Error & Edge Cases** → Skeletons > spinners, retries > dead ends, design for offline.
- **Agent-Friendly** → API-first, semantic markup, structured JSON errors.
- **Collaboration** → Shared vocab, PR checklists, design-to-code contracts.

---

## 🚫 Anti-Patterns (What _Not_ to Do)

- `div` as button/link (`<div onClick=...>`) → use `<button>` / `<a>`.
- Inline styles → breaks tokens, theming.
- Spinners-only loaders → cause CLS and bad UX.
- Removing focus rings → blocks keyboard users.
- `useEffect` for page-level data → use RSC/App Router data patterns.
- API returning HTML error pages → return JSON `{ code, message }`.
- Tailwind class soup → centralize via `cva` and tokens.

---

## 🧭 Principle Hierarchy (Conflict Scenarios)

1. **Accessibility > Aesthetics**  
   _Ghost buttons w/ pale text?_ Reject (contrast fails).
2. **Usability > Performance**  
   _Infinite scroll breaks deep linking?_ Reject.
3. **Consistency > Novelty**  
   _One-off gradient style?_ Roll out via the system or skip.
4. **Resilience > Perfection**  
   _3rd-party API flakes?_ Ship with retries/offline cache.

---

## 📏 Measurement Frameworks

- **Accessibility**: axe (0 serious/critical); Contrast ≥ 4.5:1 text, ≥ 3:1 large; full keyboard path
- **Performance (P75 mobile)**: LCP < 2.5s, INP < 200ms, CLS < 0.1; TTFB < 200ms
- **Bundles**: Marketing < 150KB gz entry; Dashboards 200–250KB; Heavy apps ≤ 300KB w/ splitting
- **Consistency**: 100% tokens; Storybook + a11y tests for all interactive components
- **Resilience**: `loading.tsx` + `error.tsx` everywhere; retry flows covered by Playwright MCP

---

## 💡 Real-World Inspirations

- Accessibility → GOV.UK: https://design-system.service.gov.uk
- Consistency → GitHub Primer: https://primer.style
- Visual Hierarchy → Stripe Dashboard: https://stripe.com/dashboard
- Performance → Vercel: https://vercel.com
- Error States → Spotify Offline Mode: https://spotify.com
- Collaboration → Shopify Polaris: https://polaris.shopify.com

---

## 📱 Mobile-First Responsive Patterns

- Nav collapses to hamburger (`<nav role="navigation">`), keyboard operable.
- Images: `next/image` + responsive `sizes="(max-width: 768px) 100vw, 50vw"`.
- Layout: default stack (`flex-col`), promote to grid at `md:` breakpoints.
- Touch targets: min 44×44px.
- Forms: full-width inputs on mobile; inline layouts desktop only.

---

## 🛠️ Claude Code Integration

**Prompt Rules**

- Semantic HTML + Tailwind tokens only.
- RSC-first; Client Components only for interactivity.
- Provide skeletons for loading, retry paths for errors.
- Use `cva` for variants; avoid CSS forks.

**Review Prompt**

> Audit this diff for a11y (axe), CWV budgets, Tailwind token usage, and error/loading/offline states. Propose and apply minimal fixes.

**Guardrails**

- Block inline styles, `div`-buttons, hidden focus, page-level `useEffect` fetching.

---

## 📋 PR Checklist

- [ ] Semantic HTML; no div-buttons
- [ ] Keyboard & focus paths complete
- [ ] Contrast meets WCAG AA
- [ ] `loading.tsx` + `error.tsx` implemented
- [ ] `next/image` / `next/font` used correctly
- [ ] Bundle budget respected
- [ ] Only design tokens; variants via `cva`
- [ ] Storybook + jest-axe + Playwright MCP tests included

---

## 🧩 Examples (Good vs Bad)

### Buttons

```tsx
// ❌ Bad
<div onClick={save}><svg/></div>

// ✅ Good
<button type="button" onClick={save} aria-label="Save">
  <SaveIcon aria-hidden="true" />
</button>
```

### **Loading**

```tsx
// ❌ Bad: spinner only (causes CLS, no structure)
return <div className="spinner" />

// ✅ Good: skeleton with reserved space
return <div className="bg-muted h-6 w-48 animate-pulse rounded" />
```

### **Data Fetching (App Router)**

```tsx
// ❌ Bad: client fetching page data
useEffect(() => { fetch('/api/posts').then(...); }, []);

// ✅ Good: Server Component fetching w/ caching
const posts = await fetch(`${process.env.API}/posts`, { next: { revalidate: 60 } })
  .then(r => r.json());
```

---

## **🔥 Error Handling & Edge Cases (Expanded)**

### **Network Errors with Retry**

```
// app/posts/error.tsx
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="p-4 border rounded-md">
      <h2 className="text-lg font-semibold">We couldn’t load posts.</h2>
      <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
      <div className="mt-3 flex gap-2">
        <button className="btn" onClick={() => reset()}>Retry</button>
        <a className="btn-ghost" href="/status">System status</a>
      </div>
    </div>
  );
}
```

### **Form Validation States (Client + ARIA)**

```tsx
// components/EmailForm.tsx
export function EmailForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('Email is required')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address')
      return
    }
    // submit…
  }

  const invalid = Boolean(error)

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setError(null)
        }}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'email-error' : undefined}
        className={cn(
          'mt-1 block w-full rounded-md border px-3 py-2',
          invalid ? 'border-destructive' : 'border-input',
          'focus-visible:outline-primary focus-visible:outline focus-visible:outline-2'
        )}
      />
      {invalid && (
        <p
          id="email-error"
          role="alert"
          className="text-destructive mt-1 text-sm"
        >
          {error}
        </p>
      )}
      <button className="btn mt-3" type="submit">
        Subscribe
      </button>
    </form>
  )
}
```

### **Progressive Enhancement Pattern**

```
// Server: render real <a>/<form> that works without JS
// Client: enhance with interception for SPA feel

// app/articles/page.tsx (RSC)
export default async function ArticlesPage() {
  const articles = await getArticles(); // SSR: works w/o JS
  return (
    <ul role="list" className="space-y-2">
      {articles.map(a => (
        <li key={a.id}>
          <a href={`/articles/${a.slug}`} className="link">{a.title}</a>
        </li>
      ))}
    </ul>
  );
}

// app/articles/[slug]/ClientEnhance.tsx (client)
"use client";
export function ClientEnhance() {
  useEffect(() => {
    // e.g., register a gentle page transition or prefetch links
  }, []);
  return null;
}
```

---

## **🎨 Design System Depth (cva Patterns)**

### **Proper Variant Pattern (with compound variants)**

```
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      intent: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:outline-secondary",
        ghost: "hover:bg-muted",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-lg",
      },
      loading: { true: "pointer-events-none" },
    },
    compoundVariants: [
      { intent: "ghost", loading: true, class: "opacity-70" },
    ],
    defaultVariants: { intent: "primary", size: "md" },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { isLoading?: boolean };

export function Button({ className, intent, size, isLoading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ intent, size, loading: isLoading }), className)} {...props}>
      {isLoading && <Spinner aria-hidden className="mr-2" />}
      {children}
    </button>
  );
}
```

---

## **🤖 Agent-Friendly Design (API-First Examples)**

### **Structured JSON Errors (Good)**

```
{
  "error": "VALIDATION_FAILED",
  "message": "Email is required",
  "fields": {
    "email": "required"
  },
  "requestId": "req_12345",
  "hint": "Provide a valid email and retry"
}
```

### **HTML Error for API Calls (Bad)**

```
<!doctype html>
<html><body><h1>500 Internal Server Error</h1></body></html>
```

### **Route Handler Shape (Consistent)**

```
// app/api/subscribe/route.ts
import { z } from "zod";
const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = Schema.parse(body);
    // …perform subscription
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "VALIDATION_FAILED", message: "Invalid input", fields: err.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return Response.json(
      { error: "INTERNAL", message: "Unexpected error", requestId: crypto.randomUUID() },
      { status: 500 }
    );
  }
}
```

---

## **🚀 Performance Specifics (Next.js)**

### **Image Optimization**

```
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  priority
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

### **Font Optimization**

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### **Code-Splitting & Dynamic Import**

```tsx
import dynamic from 'next/dynamic'
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})
```

### **Edge + Caching**

```ts
// app/api/data/route.ts
export const runtime = 'edge'

export async function GET() {
  const res = await fetch(process.env.UPSTREAM!, { cache: 'no-store' })
  return new Response(res.body, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
```
