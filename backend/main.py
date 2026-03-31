# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import step1_clinical_context, step2_data_exploration, step3_data_preparation, step4_model_params

app = FastAPI(
    title="HEALTH-AI ML Visualisation Tool — Backend",
    description=(
        "REST API for the Erasmus+ KA220-HED HEALTH-AI project. "
        "Covers Sprint 2 deliverables: Steps 1–3 of the 7-step ML pipeline."
    ),
    version="0.2.0",
)

# ── CORS (allow the React/Next dev server) ────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-Id"],   # so frontend can read the session header
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(step1_clinical_context.router)
app.include_router(step2_data_exploration.router)
app.include_router(step3_data_preparation.router)
app.include_router(step4_model_params.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Meta"])
def health():
    return {"status": "ok", "sprint": 3, "steps_implemented": [1, 2, 3, 4]}


@app.get("/", tags=["Meta"])
def root():
    return {
        "message": "HEALTH-AI Backend is running.",
        "docs": "/docs",
        "redoc": "/redoc",
    }
