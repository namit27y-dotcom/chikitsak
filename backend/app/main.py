from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.db.session import check_database_connectivity


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )

    register_exception_handlers(app)

    @app.get("/health", tags=["Health"])
    def health_check() -> JSONResponse:
        current_settings = get_settings()
        db_ok, db_status = check_database_connectivity()
        gemini_configured = bool(
            current_settings.GEMINI_API_KEY and current_settings.GEMINI_API_KEY.strip()
        )
        payload = {
            "status": "ok" if db_ok else "degraded",
            "service": "chikitsak-api",
            "database": db_status,
            "ai_configured": gemini_configured,
            "configuration": {
                "database_configured": bool(
                    current_settings.DATABASE_URL and current_settings.DATABASE_URL.strip()
                ),
                "gemini_configured": gemini_configured,
                "gemini_model": current_settings.GEMINI_MODEL,
            },
        }
        return JSONResponse(status_code=200 if db_ok else 503, content=payload)

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    return app


app = create_app()
