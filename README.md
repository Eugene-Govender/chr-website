# CHR Consulting Website

Public recruitment website and apply flow for CHR Consulting.

- **Frontend:** React + Vite (`frontend/`)
- **Backend:** FastAPI (`backend/`)

## Local development

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:8000  

## Railway deployment

See **[DEPLOY.md](./DEPLOY.md)** for service root directories and build settings.
