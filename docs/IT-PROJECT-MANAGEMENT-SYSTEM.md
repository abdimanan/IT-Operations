I want you to understand and document a new system we are going to build.

Do NOT implement application code yet.

Your first job is to create a clear Markdown specification that explains exactly what this system is, how it should work, its data relationships, user workflow, and planned features.

Create:

`docs/IT-PROJECT-MANAGEMENT-SYSTEM.md`

This document will become the source of truth for the project before development begins.

# 1. What this system is

This is an **internal IT Project Management System**.

Our IT department builds software, websites, systems, and other technology projects for external client companies.

The system is used by our IT team to manage those client projects from beginning to completion.

The core hierarchy is:

Company
↓
Project
↓
Resources
↓
Tasks
↓
Subtasks

More precisely:

Company
└── Projects
├── Resources
└── Tasks
└── Subtasks

Do NOT treat Departments as the main hierarchy.

There is one main IT department using this system. The important entity is the external **Company/Client**.

# 2. Companies

A Company represents an external client for whom our IT department is doing work.

Examples:

* ABC Trading
* Somtaana
* XYZ Logistics

A company can have multiple projects.

Example:

ABC Trading
├── E-commerce Website
├── Inventory System
└── Mobile Application

Document the expected company fields and relationships.

At minimum consider:

* id
* name
* contact information
* description
* status
* timestamps

Do not invent unnecessary fields unless there is a clear reason.

# 3. Projects

A Project represents a specific piece of work being done for a Company.

Every project belongs to one Company.

A company can have many projects.

Projects need:

* name
* description
* company_id
* start_date
* deadline_date / ultimate deadline
* status
* created_by
* timestamps

Project statuses should support at least:

* Planned
* Active
* On Hold
* Completed
* Cancelled

Explain how project progress should be calculated from its tasks.

# 4. Resources

Resources are project-specific materials or information that the IT team needs to work on the project.

Examples:

* Domain names
* Files
* Reports
* Documents
* Design files
* API documentation
* Links
* Other project materials

A resource belongs to a project.

Resources should have a type.

Suggested resource types:

* Domain
* File
* Report
* Document
* Link
* Other

Document the resource model and relationships.

Important:

Do NOT design the system to expose passwords or sensitive credentials as ordinary resource text.

If credentials are ever required, that should be treated as a separate security decision.

# 5. Tasks

Tasks represent actual pieces of work required to complete a project.

Every task belongs to a project.

A task should support:

* title
* description
* project_id
* assigned_to
* task_type
* task_level
* status
* start_time
* end_time/deadline
* notes
* created_by
* timestamps

A task may initially be unassigned.

The system should allow an administrator or authorized IT manager to assign the task to an IT team member.

Document the task lifecycle.

For example:

Unassigned
↓
Assigned
↓
In Progress
↓
Completed

Also document how cancellation should work.

# 6. Subtasks

Tasks can have child subtasks.

Example:

Project:
ABC E-commerce Website

Task:
Build Checkout

Subtasks:

* Create checkout UI
* Connect payment API
* Validate customer information
* Test successful payment
* Test failed payment

A subtask is itself a smaller unit of work belonging to a parent task.

Document:

* parent_task_id
* independent assignee
* independent status
* deadline
* relationship to parent task

Determine and document sensible rules for whether subtasks must inherit the parent's project.

Default recommendation:

A subtask must remain inside the same project as its parent task.

# 7. Assignees

Assignees are members of the internal IT team.

The system should not use the old concept of assigning work to arbitrary departments.

Instead, create/use a clear IT staff/assignee model based on the application's existing user system where possible.

Document:

* who can be an assignee
* how users become available for assignment
* active/inactive users
* who can assign tasks
* who can reassign tasks

Do not create duplicate user systems if the existing application already has a User model.

# 8. Task Types

The system needs configurable Task Types.

Examples:

* Development
* Bug Fix
* Testing
* Deployment
* Design
* Documentation
* Research
* Maintenance

These should be stored as configurable records rather than hardcoded everywhere.

Document CRUD requirements.

# 9. Task Levels

The system needs configurable Task Levels.

Examples:

* Low
* Normal
* High
* Critical

These should also be configurable records.

Document CRUD requirements.

# 10. Dashboard

The dashboard should be intentionally small.

The purpose is to quickly understand the current IT workload.

Recommended summary:

* Total Companies
* Active Projects
* Open Tasks
* Overdue Tasks

Then:

## Project Overview

Show:

* Company
* Project
* Status
* Deadline
* Progress
* Open tasks

## Upcoming Tasks

Show:

* Task
* Company
* Project
* Assignee
* Deadline
* Status

## Upcoming Project Deadlines

Show projects approaching their ultimate deadline.

## Resource Summary

Show counts/types of resources across active projects.

Avoid turning this into a large BI/analytics system.

# 11. Task Calendar

There should be a dedicated Task Calendar.

It displays:

* Task start time
* Task deadline
* Task status
* Assignee
* Project
* Company

Filtering should eventually support:

* Company
* Project
* Assignee
* Task type
* Task level
* Status

# 12. Project Calendar

There should be a separate Project Calendar.

It displays:

* Project start date
* Project ultimate deadline
* Project status
* Company

This calendar is for high-level project planning.

The Task Calendar is for detailed work.

The Project Calendar is for high-level project timelines.

Keep those purposes separate.

# 13. Navigation

The system should have a sidebar similar to:

Dashboard

Companies

Projects

Tasks

Resources

Task Calendar

Project Calendar

Settings
Task Types
Task Levels
Department Assignees

The wording "Department Assignees" comes from the earlier task-management proposal, but since this is specifically an IT department system, evaluate whether a better name such as "IT Assignees" or "Team Members" is more appropriate.

Do not make this decision silently.

Document the recommendation and the reason.

# 14. Important conceptual correction

The previous task-management specification was designed around:

Departments → Projects → Tasks.

That is NOT the correct model for this system.

The new model is:

Companies → Projects → Resources + Tasks → Subtasks

The IT department is the internal team operating the system.

The Companies are external clients.

The Projects are client work.

Resources are project materials.

Tasks represent work.

Subtasks represent smaller work items.

Make sure the Markdown document consistently uses this model.

# 15. Things that should NOT be added yet

Do not expand the project unnecessarily.

Unless existing requirements prove they are necessary, do not add:

* Kanban boards
* Gantt charts
* Recurring tasks
* Time tracking
* Complex task dependencies
* Employee performance scoring
* Large BI dashboards
* Chat systems
* Complex notification systems
* Multi-department project ownership

These can be future features.

# 16. Existing application

Before proposing implementation, inspect the existing codebase.

Look for:

* User model
* Existing roles/permissions
* Existing Task Manager
* Existing task types
* Existing task levels
* Existing calendar patterns
* Existing file upload/resource patterns
* Existing CRUD conventions
* Existing sidebar/navigation conventions
* Existing migrations
* Existing tests

Reuse existing architecture where appropriate.

Do not duplicate functionality that already exists.

# 17. Backward compatibility

The existing Task Manager may already have:

* tasks
* task types
* task levels
* assignees
* permissions
* controllers
* views

Determine what can be reused and what needs to change.

Do not delete or modify existing functionality simply because the new system is being planned.

First document:

1. What already exists
2. What can be reused
3. What needs to change
4. What is completely new
5. What risks exist

# 18. Output requirements

The Markdown file should contain these sections:

1. System Overview
2. Business Purpose
3. Core Hierarchy
4. Companies
5. Projects
6. Resources
7. Tasks
8. Subtasks
9. IT Team / Assignees
10. Task Types
11. Task Levels
12. Dashboard
13. Task Calendar
14. Project Calendar
15. Navigation
16. User Roles & Permissions
17. Data Model
18. Entity Relationships
19. Main User Workflows
20. Existing System Reuse
21. New Development Required
22. Out of Scope / Future Features
23. Open Questions
24. Recommended Implementation Phases
25. Testing Requirements

Include simple ASCII relationship diagrams where useful.

For example:

Company
│
└── Project
├── Resources
└── Tasks
└── Subtasks

Also include a database relationship diagram in text form.

# 19. Very important: planning only

Do NOT modify application code.

Do NOT create migrations.

Do NOT create controllers.

Do NOT create models.

Do NOT modify routes.

Do NOT modify Blade/React/Vue/frontend files.

Do NOT implement anything.

Only inspect the repository and create/update:

`docs/IT-PROJECT-MANAGEMENT-SYSTEM.md`

If the repository already contains relevant documentation, use it to understand the existing architecture.

Clearly mark assumptions and open questions instead of silently making business decisions.

At the end of the Markdown document, include:

**Status: Planning / Specification Only**

and explain that implementation should only begin after the specification has been reviewed and approved.
