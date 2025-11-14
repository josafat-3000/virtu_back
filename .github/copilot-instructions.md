# Copilot Instructions for virtu_back

## Overview
This project is a Node.js backend for managing visits, users, access logs, notifications, and file uploads. It uses Express, Prisma ORM, and a modular controller/service structure. The codebase is designed for extensibility and security, with a focus on role-based access and auditability.

## Architecture & Key Components
- **src/controllers/**: Main business logic for users, visits, access logs, notifications, docs, and uploads. Each controller handles request validation, Prisma queries, and response formatting.
- **src/models/**: Prisma models are defined in `prisma/schema.prisma`. All DB access is via Prisma Client.
- **src/utils/**: Utility functions for authentication (including Digest), email, token generation, and role management.
- **prisma/**: Contains `schema.prisma` (DB schema), migration files, and seed scripts for roles/users.
- **uploads/**: Directory for storing uploaded files, organized by UUID.

## Data Flow & Patterns
- **Authentication**: Uses JWT for API endpoints and Digest for external integrations. Auth middleware is in `src/middlewares/`.
- **Role Management**: Role IDs are defined in `src/utils/roles.js` and must match DB values. Always use these constants in code.
- **Visit & Upload Link Relationship**: `uploadLink` records can be related to `visits` via a foreign key. Validation flags (`validated`) are used to track confirmation status.
- **Validation**: Controllers perform explicit field validation and return localized error messages.

## Developer Workflows
- **Run in dev mode**: `npm run dev` (uses nodemon)
- **Build/start**: `npm run build`
- **Prisma migrations**: `npx prisma migrate dev --name <desc>`
- **Prisma Studio (DB UI)**: `npx prisma studio`
- **Seeding roles/users**: Run `node prisma/seedUserAndRoles.js`

## Project Conventions
- **Controllers**: Always validate input and handle errors with structured JSON responses.
- **Prisma**: All DB access via Prisma Client. Never use raw SQL unless necessary.
- **Uploads**: File uploads are handled via Multer and stored in `uploads/` by UUID. Metadata is stored in `uploadLink`.
- **Validation flags**: Use the `validated` boolean on visits and upload links to track confirmation.
- **Role IDs**: Use constants from `src/utils/roles.js` for all role checks and assignments.

## Integration Points
- **External Digest Auth**: Use `src/utils/digest.js` for making authenticated requests to external APIs.
- **Email/Notification**: Utilities in `src/utils/email.js` and `src/controllers/notificationController.js`.

## Examples
- To relate an upload to a visit, set `visitId` on `uploadLink` and update `validated` on `visits` as needed.
- To add a new role, update both the DB (via seed script) and `src/utils/roles.js`.

## Key Files
- `src/controllers/visitController.js`, `src/controllers/docsController.js`: Core business logic
- `prisma/schema.prisma`: DB schema and relationships
- `src/utils/roles.js`: Role ID constants
- `prisma/seedUserAndRoles.js`: Example seeding script

---
If any conventions or workflows are unclear, please request clarification or provide feedback for improvement.
