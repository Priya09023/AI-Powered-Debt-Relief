from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html

from app.config import get_settings
from app.database import init_db
from app.routers import auth, loans, profile, settlement, negotiation, history
from app.utils.exceptions import AppError, app_exception_handler

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Powered Debt Relief & Financial Recovery Platform API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_exception_handler)

prefix = settings.API_PREFIX
app.include_router(auth.router, prefix=prefix)
app.include_router(loans.router, prefix=prefix)
app.include_router(profile.router, prefix=prefix)
app.include_router(settlement.router, prefix=prefix)
app.include_router(negotiation.router, prefix=prefix)
app.include_router(history.router, prefix=prefix)


@app.get("/", tags=["health"])
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running", "docs": "/docs"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}
