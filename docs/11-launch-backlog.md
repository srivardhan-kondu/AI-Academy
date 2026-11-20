# First Release Backlog

## Priority definitions

- **P0:** Required for a usable first release.
- **P1:** Important shortly after launch.
- **P2:** Later enhancement.

## P0 — Core product

### Public website
- [ ] Homepage
- [ ] About and creator profile
- [ ] Responsive navigation
- [ ] SEO metadata and sitemap
- [ ] Contact page

### AI Academy
- [ ] Academy landing page
- [ ] School directory
- [ ] School detail page
- [ ] Learning path directory
- [ ] Learning path detail page
- [ ] Module detail page
- [ ] Lesson page
- [ ] Difficulty and duration labels
- [ ] Prerequisite display

### Lesson engine
- [ ] Rich text block
- [ ] Image block
- [ ] Diagram block
- [ ] Visualization block
- [ ] Code example block
- [ ] Quiz block
- [ ] Resource block
- [ ] Block ordering
- [ ] Unknown block fallback
- [ ] Mobile rendering

### Admin
- [ ] Admin login and role protection
- [ ] School CRUD
- [ ] Path CRUD
- [ ] Module CRUD
- [ ] Lesson CRUD
- [ ] Block editor
- [ ] Draft and publish
- [ ] Preview
- [ ] Media upload

### Student
- [ ] Sign up and sign in
- [ ] Student profile
- [ ] Dashboard
- [ ] Enroll in a learning path
- [ ] Mark lesson complete
- [ ] Save progress
- [ ] Bookmark lessons

### Initial learning content
- [ ] 10 fully authored lessons
- [ ] 5 learning paths
- [ ] 5 practical projects
- [ ] 5 quizzes or assessment sets
- [ ] References and review dates

## P1 — Learning depth

- [ ] 10 interactive visualizations
- [ ] Guided challenges
- [ ] Quiz attempt history
- [ ] Lesson search
- [ ] Project submissions
- [ ] Downloadable resources
- [ ] Premium content flags
- [ ] Analytics dashboard
- [ ] Email notifications

## P2 — Expansion

- [ ] Isolated Python playground
- [ ] Subscription payments
- [ ] Premium labs
- [ ] Certificates for eligible programs
- [ ] AI learning assistant
- [ ] Newsletter
- [ ] Community
- [ ] Career hub
- [ ] Institution partnerships

## Acceptance criteria examples

### Lesson publishing
- Admin can create a lesson.
- Admin can add and reorder supported blocks.
- Invalid block data is rejected with a useful message.
- Admin can preview a draft.
- Only published content appears publicly.
- Premium content is protected by server-side entitlement checks.

### Lesson progress
- A signed-in learner can start a lesson.
- Progress is saved across sessions.
- Completion is recorded only when the completion rule is satisfied.
- A learner can resume from the last saved position.
- One user's progress cannot be read or changed by another user.

### Interactive visualization
- The lab loads with a meaningful default state.
- Controls update the visualization.
- Reset restores the initial state.
- The explanation remains understandable without interaction.
- Keyboard access and mobile layout are tested.

### Code execution
- Code runs outside the main application process.
- Execution time and resource use are limited.
- Secrets and private application data are inaccessible.
- Network access is restricted.
- Errors are returned safely.
- Abuse controls and monitoring are enabled.

## Launch definition

The product is ready for a controlled launch when a learner can discover a path, understand its prerequisites, complete a lesson with an interactive component, take an assessment, see progress and return later to continue learning. An administrator must be able to create and publish that lesson without changing application code.
