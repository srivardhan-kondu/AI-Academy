# Development Roadmap

## Guiding approach

Build the reusable platform infrastructure before trying to populate every curriculum school.

A strong first lesson experience is more valuable than hundreds of shallow pages.

## Phase 0: Product definition

Deliverables:
- Confirm brand and positioning
- Confirm sitemap
- Define initial audience
- Approve initial learning paths
- Create design system
- Define content schema
- Define free and premium permissions

Exit criteria:
- Approved product scope
- Approved first-release backlog
- Technical architecture decision record

## Phase 1: Public website and Academy foundation

Build:
- Homepage
- About page
- Public navigation
- Academy landing page
- School pages
- Module pages
- Lesson page shell
- Responsive design

Exit criteria:
- Users can browse the curriculum.
- Pages are responsive and accessible.
- Content is data-driven.

## Phase 2: Content management

Build:
- Admin authentication and roles
- School management
- Learning path management
- Module management
- Lesson editor
- Block ordering
- Draft and publish workflow
- Preview mode
- Media management

Exit criteria:
- An administrator can publish a lesson without a code change.

## Phase 3: Student experience

Build:
- Authentication
- Student profile
- Dashboard
- Enrollments
- Lesson progress
- Bookmarks
- Quiz attempts
- Continue learning

Exit criteria:
- A student can sign in, start a path, complete lessons and see progress.

## Phase 4: Interactive engine

Build:
- Block registry
- Lesson renderer
- Interactive component framework
- Initial visualizations
- Reset and guided challenge behavior
- Error handling
- Accessibility and mobile behavior

Initial labs:
1. AI vs ML vs DL explorer
2. Neuron playground
3. Gradient descent playground
4. Linear regression explorer
5. Decision tree explorer
6. K-means simulator
7. Confusion matrix explorer
8. Tokenization explorer
9. Attention explorer
10. Prompt playground

Exit criteria:
- At least 10 labs work inside real lessons.
- Admins can configure supported labs.
- Fallback explanations are available.

## Phase 5: Coding and projects

Build:
- Isolated Python execution
- Coding exercises
- Output comparison
- Project library
- Project submissions
- Basic project feedback workflow

Exit criteria:
- Code execution is isolated, rate-limited and monitored.
- Learners can complete a guided coding exercise safely.

## Phase 6: Freemium and payments

Build:
- Free and premium entitlements
- Subscription checkout
- Payment webhooks
- Subscription management
- Upgrade and cancellation flows
- Server-side access checks

Exit criteria:
- Premium access cannot be granted by changing client-side state.
- Payment state and entitlements remain consistent.

## Phase 7: Launch and expansion

Build:
- Initial content library
- Search
- Analytics
- SEO
- Performance monitoring
- Feedback collection
- Support workflow

Launch targets:
- 5 learning paths
- 30 detailed lessons
- 10 interactive visualizations
- 5 practical projects
- Student accounts
- Admin CMS
- Free and premium permissions

## Phase 8: Ongoing expansion

Potential additions:
- Remaining learning schools
- More projects and assessments
- AI tools directory
- AI journal
- Career hub
- Newsletter
- Workshops
- Community features
- Multilingual content if demand supports it

## Release discipline

For each phase:
- Define acceptance criteria.
- Test on mobile and desktop.
- Test permissions.
- Test accessibility.
- Test loading and failure states.
- Review analytics and user feedback.
- Avoid starting the next major feature while core workflows are unreliable.
