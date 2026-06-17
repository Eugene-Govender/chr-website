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
- **Health check path:** `/`
- Deploy config: `frontend/railway.json` + `frontend/railpack.toml`

### Backend / API service
- **Settings → Root Directory:** `backend` **(required)**
- **Health check path:** `/health`
- Deploy config: `backend/railway.json` + `backend/railpack.toml`

> **Important:** The backend service must **not** use the repo root. If Root Directory is wrong, Railpack cannot find `requirements.txt` and the build will fail.

## What gets built

**Frontend**
```bash
npm ci && npm run build
npm run start   # serves frontend/dist
```

**Backend**
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Troubleshooting

**`Railpack could not determine how to build the app`**
- Frontend: ensure Root Directory is `frontend` or repo root (root `package.json` exists).
- Backend: set Root Directory to `backend`.

**`Script start.sh not found`**
- Normal warning if no custom start script; Railway uses `railway.json` / `railpack.toml` instead.

**Site updates not appearing**
- Confirm the deploy succeeded on the **frontend** service.
- Hard refresh the browser (`Ctrl+F5`).
