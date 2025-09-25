# GC Forms - AI Assistant Instructions

## Project Overview
GC Forms is a Next.js 15+ application for creating and managing government forms in Canada. It's a bilingual (English/French) platform with complex form building, submission processing, and administrative capabilities.

## Architecture Highlights

### Monorepo Structure
- **Yarn workspaces** with packages in `/packages/` (core, types, editor, connectors, announce, tag-input)
- **Utilities** in `/utils/` for data migration and processing scripts
- **Main app** uses Next.js App Router with route groups: `(gcforms)/[locale]/(form administration|app administration|form filler|static pages|support|user authentication)`

### Key Tech Stack
- **Next.js 15** with App Router, Turbopack, and server components
- **Prisma** for database ORM with PostgreSQL
- **NextAuth 5** for authentication with custom Cognito integration
- **i18next** for bilingual support (English/French)
- **Tailwind CSS + SCSS** for styling
- **Redis** for caching and session management
- **AWS services** (S3, SQS, Lambda, DynamoDB, Cognito)

### Data Flow & Security
- **Server Actions** for form mutations (see `lib/actions/`)
- **Middleware** handles CSP, i18n, auth, and request validation
- **Privilege-based access control** via Prisma `User.privileges[]`
- **Audit logging** for all form operations
- **File uploads** to S3 with virus scanning

## Development Workflows

### Essential Commands
```bash
# Development with Prisma setup
yarn dev  # Runs prisma:dev then next dev --turbopack

# Testing approaches (dual setup)
yarn test              # Jest for legacy tests
yarn test:watch:vitest # Vitest for new tests (.vitest.ts files)

# Database operations
yarn prisma:studio     # GUI for database
yarn prisma:dev        # Migrate + seed development data
yarn prisma:reset      # Clean slate reset

# Cypress E2E (requires specific build)
yarn build:test && yarn start:test  # NOT yarn dev
yarn cypress:e2e
```

### Environment Setup
- Clone `forms-terraform` repo and run Localstack for local AWS services
- Use `.env.example` as template (ready version in 1Password > Local Development .ENV)
- Admin access: Login → Prisma Studio → Edit User privileges → Logout/Login

## Code Patterns & Conventions

### Component Architecture
- **Server Components** in `components/serverComponents/` (default)
- **Client Components** in `components/clientComponents/` with "use client"
- **Route Groups** organize app structure: `(gcforms)/[locale]/(feature)/`

### Form Handling
- **Form templates** stored as JSON in `Template.jsonConfig`
- **Form elements** typed in `@gcforms/types` package
- **Form builder** logic in `lib/formBuilder.tsx` and `@gcforms/editor`
- **Conditional logic** via `ConditionalRule` system for show/hide elements

### Data Validation
- **Valibot** for runtime validation (preferred over Zod)
- **Form schema validation** in `lib/validation/`
- **File type validation** via `@gcforms/core` utilities

### Internationalization
- **Route-based locale**: `app/(gcforms)/[locale]/`
- **Server-side i18n**: Import translations directly in server components
- **Client-side i18n**: Use `useTranslation()` hook
- **Translation files**: `i18n/translations/{en,fr}/`

### Testing Strategy
- **Jest** for existing tests (`*.test.ts` files)
- **Vitest** for new tests (`*.vitest.ts` files in `lib/vitests/`)
- **Cypress** for E2E (must use `build:test` + `start:test`, not `dev`)
- **Test database**: Separate Prisma environment with seeded data

## Integration Points

### AWS Services
- **S3**: File uploads via presigned URLs
- **Cognito**: User authentication (custom flows in `lib/auth/cognito.ts`)
- **SQS**: Background processing queues
- **Lambda**: Virus scanning, form processing

### Database Patterns
- **Prisma relations**: User → Template → Submission flows
- **Soft deletes**: Many models use `active` boolean instead of DELETE
- **Audit trails**: Most operations logged via `lib/auditLogs.ts`
- **TTL fields**: Automatic cleanup for temporary data

### Caching Strategy
- **Redis**: Session storage, rate limiting, feature flags
- **Next.js cache**: Custom handler for Lambda environments
- **CDN**: Static assets and form responses

## Common Tasks

### Adding New Form Elements
1. Define type in `packages/types/src/` 
2. Add to form builder in `@gcforms/editor`
3. Implement rendering in form components
4. Update validation schemas

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `yarn prisma:dev` to generate migration
3. Update related TypeScript types
4. Test with `yarn prisma:reset` for clean state

### API Routes
- Use **Server Actions** over API routes when possible
- API routes in `app/api/` for webhooks and external integrations
- Validate requests in middleware for size limits (`BODY_SIZE_LIMIT`)

Remember: This is a government application requiring high security standards, accessibility compliance, and bilingual support throughout.
