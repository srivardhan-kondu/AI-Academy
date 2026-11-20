# Srivardhan AI — Interactive AI Learning Platform

**Learn difficult things the easy way.** This is the first release of the platform described in the blueprint documents in [`docs/`](docs/) (`01-…` to `11-…`).

Every lesson follows the same learning loop: **Understand → Visualize → Experiment → Implement → Practice → Apply**.

## Quick start

Requires Node.js 20+ and a [Neon](https://neon.tech) PostgreSQL database.

```bash
npm install
cp .env.example .env.local   # then paste your Neon connection string into DATABASE_URL
npm run setup                # applies migrations and seeds content (only if the database is empty)
npm run dev                  # http://localhost:3000
```

Sign in to the admin CMS at `/login` with the seeded account:

- **Email:** `admin@academy.local`
- **Password:** `ChangeMe-Admin-123`

You can change these in `.env.local` before running `npm run setup`. Change the password after you first sign in (Account → Change password).

| Command | What it does |
|---|---|
| `npm run setup` | Applies pending migrations; seeds content only if the database is empty. Safe to re-run. |
| `npm run setup -- --reset` | **Drops every table and all data**, then migrates and reseeds from scratch. |
| `npm run dev` / `build` / `start` | Next.js development server, production build, production server. |
| `npm test` | Business-rule tests (visibility, grading, completion, entitlements) and render tests for all labs. Each run uses a temporary Postgres schema in Neon that is dropped afterwards, so real data is never touched. |
| `npm run typecheck` / `lint` | TypeScript and ESLint. |
| `npm run db:generate` | Generates a new SQL migration after you edit `lib/db/schema.ts`. |

## What's included

### Learner experience
- **Public site:** home, about, contact, pricing (Free & Premium), a two-question "find your path" flow, search, SEO metadata, `sitemap.xml` and `robots.txt`.
- **AI Academy:** all **19 schools** from the curriculum, grouped into 4 levels, each with its full topic outline. Also school, module, learning-path and lesson pages, with difficulty, duration, access tier and prerequisite labels.
- **5 learning paths:** AI for Absolute Beginners, Python for AI, Machine Learning Engineer, Generative AI Developer (Premium) and Prompt Engineering Specialist.
- **16 fully written lessons**, each following the 12-part lesson template. Each has references, a last-reviewed date, objectives, an analogy and where it breaks down, a technical deep dive, a tested code example with its expected output, guided practice with hints, a server-graded knowledge check, and a summary.
- **13 interactive labs:**
  - AI/ML/DL explorer
  - neuron playground
  - gradient descent
  - linear regression
  - decision tree
  - K-means
  - confusion matrix
  - tokenizer
  - embeddings
  - attention
  - temperature/sampling
  - prompt playground
  - RAG pipeline

  Every lab has a learning objective, useful defaults, a reset button, a live "what's happening" explanation and a guided challenge. All are keyboard accessible and mobile-friendly, and each has a text fallback that works without interaction.
- **5 guided projects** with milestones, a definition of done, and project submissions that admins can review.
- **Student accounts:**
  - sign up and sign in
  - dashboard with "continue learning"
  - path enrolment and progress
  - lesson progress that resumes from the last block you reached
  - bookmarks
  - quiz history
  - milestones
  - profile editing, password change and account deletion

### Admin CMS (`/admin`)
- Create and edit schools, modules, learning paths (with ordered, required or optional modules), lessons, quizzes, labs and projects.
- **Block editor:** add, edit, reorder and delete lesson blocks. Each block is validated against a strict schema, and invalid blocks are rejected with a useful message.
- **Publishing workflow:**
  - draft, then preview, then publish now or schedule for later
  - unpublish or archive
  - a revision snapshot on every publish, with restore
  - publishing is blocked until there is at least one block, every block is valid, quizzes have questions, there is at least one objective, and a last-reviewed date is set
- Media uploads (images and PDFs). Files are type-checked by their contents and stored in the database (Neon), so there is no local disk state.
- Users (admin only): change roles, and grant or revoke Premium.
- Analytics: starts, completions, drop-off and quiz pass rates per lesson, plus searches that returned no results.
- Contact messages, a content-freshness report (lessons not reviewed in six months), and an audit log of every admin change.

### Security and data rules (docs/06 §5, docs/07 §8)
- **Every** authorization and Premium check runs on the server. There is no client-side Premium flag. Premium lesson content is never sent to users who aren't entitled to it.
- Quiz answer keys and explanations never reach the browser before submission. Grading happens on the server.
- Only published content is shown publicly, and scheduled lessons stay hidden until their publish time.
- Each user's progress, bookmarks and submissions are scoped to that user.
- Sessions are random tokens stored hashed in the database, in HTTP-only `SameSite=Lax` cookies that are `Secure` whenever the site URL is HTTPS.
- Passwords are hashed with bcrypt.
- Rate limits apply to sign-up, sign-in, quiz submission, progress saves, contact and submissions.
- Markdown never renders raw HTML. Videos are limited to YouTube and Vimeo embeds. Links must use `https:`.
- Security headers are set (`nosniff`, `frame-options`, `referrer-policy` and `permissions-policy`).

## Project structure

```text
app/                    Routes (App Router)
  academy/              Schools, paths, modules, lessons
  labs/ projects/       Lab library, project lab
  dashboard/ account/   Student area
  admin/                CMS
  actions/              Server actions (auth, learning, admin, profile, contact)
  media/[id]/           Serves uploaded media
components/
  lesson/               Lesson renderer, block registry, block components, progress tracker
  visualizations/       Lab registry (lazy-loaded), shared lab kit, 13 labs
  admin/ academy/ ui/   CMS forms, cards, primitives
lib/
  db/                   Drizzle schema (docs/07) and Neon connection pool
  auth/                 Sessions and passwords
  permissions/          Server-side entitlement checks
  content/              Published-content queries and search
  progress/             Progress, completion rules, enrolments, achievements
  assessment/           Server-side quiz grading
  lesson/               Block schemas (zod) and lab keys
content/                Seed curriculum, lessons, paths, labs, projects
scripts/                setup and seed
drizzle/                SQL migrations
tests/                  node:test suites
```

### How a lesson is rendered
1. Lesson blocks are stored as ordered rows (`lesson_blocks.content_json`).
2. On the server, `loadBlocks()` validates every block against its zod schema in `lib/lesson/blocks.ts`.
3. `LessonRenderer` looks up each block type in the explicit `lessonBlockRegistry`. Unknown or invalid blocks render nothing for learners, and a red diagnostic for staff in preview.
4. A `visualization` block names a lab key. The lab registry loads that lab's code only when it's needed (`next/dynamic`), inside an error boundary that falls back to the block's written explanation.

### Adding a new lab
1. Create `components/visualizations/labs/my-lab.tsx`. Use `LabShell` for reset, explanation and challenge.
2. Add its key to `LAB_KEYS` in `lib/lesson/labs.ts` and register it in `components/visualizations/registry.tsx`.
3. Add a catalogue entry in `content/curriculum.ts` (or insert a row into `interactive_components`).
4. Use it in any lesson through a "visualization" block in the admin block editor.

## Technology choices

Next.js 16, React 19, TypeScript, Tailwind 4, and **Drizzle ORM on Neon PostgreSQL** (via `pg`). Authentication is built in: hashed-token sessions stored in Postgres, in HTTP-only cookies.

- **Connection:** `DATABASE_URL` should be Neon's *pooled* connection string. The pool is created once in `lib/db/index.ts`.
- **Schema changes:** edit `lib/db/schema.ts`, run `npm run db:generate`, review the SQL in `drizzle/`, then run `npm run setup` to apply it.
- **Rate limiting** is in memory, per server instance. Replace `lib/rate-limit.ts` with a shared store (for example Redis) if you run several instances.
- **Row Level Security:** the application enforces per-user access on the server. If you later expose the database directly to clients, add RLS policies for the user-owned tables too.

## Not yet built (by design)

These match the P2 items and later phases in `docs/10` and `docs/11`:
- **Python code execution:** code blocks are read-only with expected output. The spec requires a separate, isolated execution service, which must never run inside the Next.js process.
- **Payments:** Premium is granted manually by admins (`subscriptions.provider = "manual"`), and entitlements are already checked server-side. Connecting a payment provider means adding checkout and a webhook that writes to `subscriptions`.
- AI Tools Directory, Knowledge Hub/journal, Career Hub, newsletter, email notifications, community features and certificates.
- Third-party analytics such as PostHog or Google Analytics. Learning analytics are built into `/admin/analytics`.

## Deployment notes
- The app has no local state (data and uploads live in Neon), so it can be deployed to Vercel or any Node host.
- Set `DATABASE_URL` (pooled Neon URL) and `NEXT_PUBLIC_SITE_URL` (your `https://` origin, which also enables Secure cookies) as environment variables.
- Run `npm run setup` once against the production database (or in CI) to apply migrations.
- Use Neon branches for staging and point-in-time restore for backups.
