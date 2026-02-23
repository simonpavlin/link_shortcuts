# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build locally
```

**Docker (production):**
```bash
docker compose up -d --build   # Build and run on port 6725
```

## Architecture

React + Vite SPA served via nginx in production.

- `src/main.jsx` — entry point, mounts `<App />` into `#root`
- `src/App.jsx` — root component
- `src/index.css` — global styles (CSS reset + layout utilities)

**Deployment:** Pushing to `master` triggers a GitHub Actions workflow (`.github/workflows/deploy.yml`) that SSHs into the production server and runs `docker compose up -d --build`. The Docker build is multi-stage: Node 20 builds the static assets, then nginx:alpine serves them. nginx is configured (`nginx.conf`) with `try_files` fallback to `index.html` for SPA routing.

Required GitHub secrets for deployment: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT`, `SERVER_KNOWN_HOSTS`, `SERVER_PASSPHRASE`.
