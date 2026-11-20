# Database Schema and Data Model

This document describes the logical data model. Final SQL types, indexes, constraints and policies should be reviewed during implementation.

## 1. Curriculum entities

### schools
Represents a curriculum school such as Machine Learning or Computer Vision.

Suggested fields:
- id
- title
- slug
- description
- level
- display_order
- icon
- cover_image
- status
- created_at
- updated_at

### learning_paths
Represents a goal-oriented learning journey.

Suggested fields:
- id
- title
- slug
- description
- audience
- difficulty
- estimated_minutes
- prerequisites
- learning_outcomes
- access_tier
- status

### modules
Represents a group of related lessons within a school.

Suggested fields:
- id
- school_id
- title
- slug
- description
- difficulty
- display_order
- prerequisites
- status

### learning_path_modules
Joins learning paths to modules.

Suggested fields:
- id
- learning_path_id
- module_id
- display_order
- is_required

### lessons
Represents an individual lesson.

Suggested fields:
- id
- module_id
- title
- slug
- summary
- difficulty
- estimated_minutes
- learning_objectives
- prerequisite_lesson_ids
- access_tier
- status
- version
- last_reviewed_at
- published_at
- created_by
- updated_by

### lesson_blocks
Stores ordered content blocks.

Suggested fields:
- id
- lesson_id
- block_type
- display_order
- content_json
- version
- created_at
- updated_at

Validate `content_json` against a schema for the selected block type.

## 2. Interactive content

### interactive_components
Catalogues reusable interactive labs.

Suggested fields:
- id
- title
- slug
- component_key
- description
- configuration_schema
- version
- status

A lesson block may reference a registered interactive component and provide validated configuration.

## 3. Assessment entities

### quizzes
- id
- lesson_id
- title
- pass_threshold
- settings
- status

### quiz_questions
- id
- quiz_id
- question_type
- prompt
- options_json
- answer_key
- explanation
- display_order
- points

Protect answer keys from unauthorized client access before submission.

### quiz_attempts
- id
- user_id
- quiz_id
- score
- total_points
- passed
- answers_json
- completed_at

## 4. Student entities

### user_profiles
- user_id
- display_name
- avatar_url
- learning_goal
- experience_level
- created_at
- updated_at

### user_enrollments
- id
- user_id
- learning_path_id
- enrolled_at
- status

### lesson_progress
- id
- user_id
- lesson_id
- status
- progress_percent
- last_block_id
- started_at
- completed_at
- updated_at

Enforce uniqueness for the user and lesson combination.

### bookmarks
- id
- user_id
- resource_type
- resource_id
- created_at

### achievements
- id
- title
- description
- criteria_json
- icon

### user_achievements
- id
- user_id
- achievement_id
- awarded_at

## 5. Projects and resources

### projects
- id
- title
- slug
- description
- difficulty
- prerequisites
- instructions
- expected_outcomes
- source_url
- access_tier
- status

### project_submissions
- id
- user_id
- project_id
- submission_url
- notes
- status
- feedback
- submitted_at

### resources
- id
- title
- resource_type
- file_path_or_url
- description
- access_tier
- status
- last_reviewed_at

## 6. Commercial and editorial entities

### subscriptions
- id
- user_id
- provider
- provider_customer_id
- provider_subscription_id
- plan
- status
- current_period_start
- current_period_end

### articles
- id
- title
- slug
- excerpt
- body
- author_id
- status
- published_at
- last_reviewed_at

### tools
- id
- name
- slug
- category
- description
- website_url
- pricing_model
- status
- last_verified_at

## 7. Relationships

- A school has many modules.
- A module belongs to a school and has many lessons.
- A learning path has many modules through `learning_path_modules`.
- A lesson has many ordered lesson blocks.
- A lesson may have one or more quizzes.
- A user can enroll in many learning paths.
- A user can have progress records for many lessons.
- A user can bookmark lessons, articles, tools and resources.
- A project can have many submissions.
- A user can have one or more subscription records over time.

## 8. Data and access rules

- Public users can read published public content.
- Authenticated users can read content allowed by their entitlements.
- Users can read and update only their own profile, progress, bookmarks and submissions.
- Administrators can manage content according to their role.
- Premium entitlements are checked server-side.
- Quiz answer keys are not exposed before submission.
- Administrative actions should be auditable.
- Use Row Level Security for user-owned records.
