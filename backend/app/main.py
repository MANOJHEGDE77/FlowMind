import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database.session import init_db
from app.api.api import api_router

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("flowmind")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FlowMind Decision Intelligence Engine...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down FlowMind Engine.")

app = FastAPI(
    title="FlowMind API",
    description="AI Decision Intelligence Platform — Multi-Agent Orchestration, RAG Evidence Engine, Decision Space Graph",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred in FlowMind Engine.", "error": str(exc)}
    )

# Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FlowMind AI Decision Engine",
        "environment": settings.ENV,
        "agents": ["Analyst", "Optimist", "Skeptic", "Financial", "Long-Term", "Devil's Advocate", "Synthesizer"]
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to FlowMind — AI Decision Intelligence Platform API",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
