# CHR Website — Railway Deployment

This repo is a **monorepo** with two deployable services:

| Service | Root Directory | What it runs |
|---------|----------------|--------------|
| **Website (frontend)** | `frontend` or repo root | React app served from `dist/` |
| **API (backend)** | `backend` | FastAPI (`uvicorn main:app`) |

## Railway setup (required)

In the Railway dashboard, open **each service** and set:

### Frontend / website service
- **Settings → Root Directory:** `frontend`  
  *(or leave empty / use repo root — root `package.json` builds the frontend)*
- **Settings → Build → Custom Build Command:** leave **empty**  
  *(if set to `npm ci && npm run build` deploys will fail with EBUSY — Railpack already runs `npm ci` in install)*
- **Health check path:** `/`
- Deploy config: `frontend/railway.json` + `frontend/railpack.json`

> **Railway config file path:** If you set a config file in the dashboard, use  
> `/frontend/railway.json` (absolute from repo root). The config file does **not** follow Root Directory automatically.

### Backend / API service
- **Settings → Root Directory:** `backend` **(required)**
- **Health check path:** `/health`
- Deploy config: `backend/railway.json` + `backend/railpack.toml`

> **Important:** The backend service must **not** use the repo root. If Root Directory is wrong, Railpack cannot find `requirements.txt` and the build will fail.

## What gets built

**Frontend**
```bash
npm ci          # install phase (Railpack)
npm run build   # build phase
npm run start   # serves frontend/dist
```

**Backend**
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Troubleshooting

**`EBUSY: resource busy or locked, rmdir node_modules/.vite`**
- Custom Build Command in Railway includes `npm ci` — remove it; use only `npm run build` or leave empty.
- Install phase already runs `npm ci`; build must be `npm run build` only (see `frontend/railway.json`).

**`Railpack could not determine how to build the app`**
- Frontend: ensure Root Directory is `frontend` or repo root (root `package.json` exists).
- Backend: set Root Directory to `backend`.

**`Script start.sh not found`**
- Normal warning if no custom start script; Railway uses `railway.json` / `railpack.toml` instead.

**Site updates not appearing**
- Confirm the deploy succeeded on the **frontend** service.
- Hard refresh the browser (`Ctrl+F5`).
