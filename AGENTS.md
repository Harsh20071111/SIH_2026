# Hackathon Repository Agent Guide

## Repository Structure
- Monorepo managed with pnpm
- Main workspace in `Hackathon-Merged/`
- Applications in `artifacts/`:
  - `api-server`: Express.js backend (port 5001)
  - `securedocs-dashboard`: Main React dashboard
  - `mockup-sandbox`: Experimental UI sandbox
- Docker configs in `docker/`:
  - `api.Dockerfile`: Multi-stage build for API server
  - `dashboard.Dockerfile`: Multi-stage build for dashboard (Nginx)
  - `nginx.conf`: Nginx config with API proxy

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

## Database (MongoDB)
- Uses **Mongoose** ODM with **MongoDB**
- Default connection: `mongodb://localhost:27017/securedocs`
- Set via `MONGODB_URI` environment variable

## Docker Setup (Full-Stack)
All services run via Docker Compose from `Hackathon-Merged/`:

### Start Everything
```bash
docker compose up --build        # Build & start (first time)
docker compose up -d             # Start in background
docker compose down              # Stop all services
docker compose down -v           # Stop & delete all data (including DB)
```

### Services & Ports
| Service      | Container               | Port          | Description              |
|------------- |-------------------------|---------------|--------------------------|
| `mongodb`    | `securedocs-mongo`      | `27017`       | MongoDB 7.0 database     |
| `mongo-ui`   | `securedocs-mongo-ui`   | `8081`        | Mongo Express GUI        |
| `api`        | `securedocs-api`        | `5001`        | Express.js API server    |
| `dashboard`  | `securedocs-dashboard`  | `3000`        | React dashboard (Nginx)  |

### Seeding (after containers are running)
```bash
docker compose exec api node --enable-source-maps ./dist/index.mjs  # verify API is healthy first
# OR seed from local machine:
cd Hackathon-Merged && pnpm --filter @workspace/api-server run seed
```

### View Logs
```bash
docker compose logs -f api         # API server logs
docker compose logs -f dashboard   # Dashboard/Nginx logs
docker compose logs -f mongodb     # MongoDB logs
```

## Development Workflow (Without Docker)
1. Start MongoDB: `docker compose up mongodb -d` (just the DB container)
2. Start API server: `npm run dev:api`
3. Start dashboard: `npm run dev`
4. API server auto-rebuilds with esbuild on changes
5. Frontend apps use Vite with HMR

## Key Details
- **Package manager**: pnpm only (enforced by preinstall script)
- **API server**: Uses esbuild for bundling, outputs ESM
- **Frontend**: Vite + React + Tailwind CSS
- **TypeScript**: Strict mode enabled, noUnusedLocals false
- **Environment**: API server reads NODE_ENV (dev/prod)
- **Ports**: API defaults to 5001, frontend Vite ports vary

## Gotchas
- Must use pnpm; npm/yarn will fail due to preinstall script
- API server builds to `dist/` and runs from there
- Type checking is separate from building (`typecheck` vs `build`)
- External dependencies in esbuild config are extensive (native modules, cloud SDKs, etc.)
- API uses `export NODE_ENV=development` in dev script
- MongoDB must be running before starting the API server
- In Docker, the dashboard's Nginx proxies `/api/*` to the API container