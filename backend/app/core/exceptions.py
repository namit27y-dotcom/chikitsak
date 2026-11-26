import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("chikitsak")


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400, code: str = "bad_request"):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message, "code": exc.code},
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "code": "http_error"},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = []
        for err in exc.errors():
            loc = ".".join(str(part) for part in err.get("loc", []) if part != "body")
            errors.append({"field": loc, "message": err.get("msg", "Invalid value")})
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Validation failed for the submitted payload.",
                "code": "validation_error",
                "errors": errors,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server exception: %s", type(exc).__name__)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An internal server error occurred. Please try again.",
                "code": "internal_server_error",
            },
        )
