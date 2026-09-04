# Hackathon Repository Agent Guide

## Repository Structure
- Monorepo managed with pnpm
- Main workspace in `Hackathon-Merged/`
- Applications in `artifacts/`:
  - `api-server`: Express.js backend (port 5001)
  - `securedocs-dashboard`: Main React dashboard
  - `mockup-sandbox`: Experimental UI sandbox
- Shared libraries in `lib/`:
  - `api-client-react`: React API client
  - `api-zod`: API validation schemas
  - `db`: Database layer (includes migration scripts)
  - `api-spec`: API specifications

## Essential Commands
**From repository root:**
- `npm run dev` - Start dashboard development server
- `npm run dev:api` - Start API server (port 5001)
- `npm run dev:mockup` - Start mockup sandbox
- `npm run build` - Build all packages (typecheck → build)

**From Hackathon-Merged/ (pnpm workspace):**
- `pnpm dev` - Same as `npm run dev` (dashboard)
- `pnpm dev:api` - Start API server
- `pnpm dev:mockup` - Start mockup sandbox
- `pnpm build` - Full build (typecheck → build)
- `pnpm typecheck` - Type-check all packages
- `pnpm typecheck:libs` - Type-check shared libraries only

## Database Operations
- Uses Drizzle ORM with PostgreSQL
- Migration commands (run from Hackathon-Merged/):
  - `pnpm --filter db push` - Push schema changes to database
  - `pnpm --filter db push-force` - Force push schema changes
- Post-merge workflow: `pnpm install --frozen-lockfile` then `pnpm --filter db push`

## Development Workflow
1. Start API server first: `npm run dev:api`
2. Start dashboard: `npm run dev`
3. API server auto-rebuilds with esbuild on changes
4. Frontend apps use Vite with HMR

## Key Details
- **Package manager**: pnpm only (enforced by preinstall script)
- **API server**: Uses esbuild for bundling, outputs ESM
- **Frontend**: Vite + React + Tailwind CSS
- **TypeScript**: Strict mode enabled, noUnusedLocals false
- **Validation**: Zod schemas (lib/api-zod/)
- **Environment**: API server reads NODE_ENV (dev/prod)
- **Ports**: API defaults to 5001, frontend Vite ports vary

## Gotchas
- Must use pnpm; npm/yarn will fail due to preinstall script
- API server builds to `dist/` and runs from there
- Type checking is separate from building (`typecheck` vs `build`)
- External dependencies in esbuild config are extensive (native modules, cloud SDKs, etc.)
- API uses `export NODE_ENV=development` in dev script
- Database requires DATABASE_URL environment variable to be set