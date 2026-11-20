# Technical Architecture

## 1. Recommended stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion for purposeful UI animation

### Backend and data
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Next.js server-side routes or server actions for application workflows

### Content
- Structured lesson content stored in PostgreSQL initially.
- Reusable block-based lesson renderer.
- Optional dedicated headless CMS later if editorial workflow complexity justifies it.

### Interactive learning
- React and SVG for most visualizations.
- D3.js for complex data visualization.
- Canvas where needed.
- A separate isolated Python execution service.

### Hosting and monitoring
- Vercel for the Next.js application.
- Supabase for database, authentication and storage.
- PostHog for product analytics.
- Google Analytics for acquisition analytics.
- Error monitoring such as Sentry when operational needs justify it.

## 2. High-level architecture

```text
Learner / Visitor
       |
       v
Next.js Web Application
       |
       +------ Public content
       |
       +------ AI Academy
       |          |
       |          +--- Lesson Renderer
       |          +--- Interactive Labs
       |          +--- Assessments
       |          +--- Progress Tracking
       |
       +------ Student Dashboard
       |
       +------ Admin CMS
       |
       v
Application Services
       |
       +------ Supabase Auth
       +------ PostgreSQL
       +------ Supabase Storage
       +------ Payment Provider
       +------ Analytics / Monitoring
       |
       +------ Isolated Code Execution Service
```

## 3. Application areas

Suggested routes:

```text
/
 /about
 /journal
 /journal/[slug]
 /tools
 /resources

/academy
/academy/schools/[schoolSlug]
/academy/paths/[pathSlug]
/academy/modules/[moduleSlug]
/academy/lessons/[lessonSlug]

/labs
/labs/[labSlug]
/projects
/projects/[projectSlug]
/careers

/dashboard
/dashboard/learning
/dashboard/bookmarks
/dashboard/achievements
/account

/admin
/admin/schools
/admin/paths
/admin/modules
/admin/lessons
/admin/labs
/admin/quizzes
/admin/projects
/admin/users
/admin/analytics
```

## 4. Suggested repository structure

```text
ai-platform/
├── app/
│   ├── (public)/
│   ├── academy/
│   ├── labs/
│   ├── projects/
│   ├── dashboard/
│   ├── admin/
│   └── api/
├── components/
│   ├── lesson/
│   ├── visualizations/
│   ├── navigation/
│   └── ui/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── progress/
│   ├── permissions/
│   └── validation/
├── types/
├── content/
├── public/
└── tests/
```

## 5. Security requirements

- Enforce authorization on the server, not only in the UI.
- Use Supabase Row Level Security for user-owned data.
- Keep service-role keys and payment secrets server-side.
- Validate and sanitize all user input.
- Validate lesson block schemas.
- Restrict admin operations to authorized roles.
- Rate-limit authentication, assessments and expensive operations.
- Never execute arbitrary code in the main application process.
- Isolate code execution with strict CPU, memory, time and filesystem limits.
- Restrict outbound network access from code sandboxes.
- Avoid storing unnecessary personal data.
- Provide a process for account and data deletion.

## 6. Content delivery and caching

- Cache public published lessons where appropriate.
- Keep private student progress out of public caches.
- Invalidate relevant content when a lesson is published or updated.
- Optimize images and media.
- Lazy-load interactive code and large visualizations.
- Use pagination for large directories and admin tables.

## 7. Search

Start with PostgreSQL full-text search for:
- Schools
- Learning paths
- Modules
- Lessons
- Articles
- Tools

Add a dedicated search service only when search quality, scale or filtering needs justify it.

## 8. Payments

Use a payment provider that supports the target country, subscriptions, webhooks, tax requirements and the desired payment methods. Verify current availability and commercial terms before implementation.

Subscription entitlements must be verified server-side. Never rely on a client-side premium flag.

## 9. Deployment environments

Maintain:
- Local development
- Staging
- Production

Use separate credentials and databases where practical. Run migrations and automated tests before production deployment.
