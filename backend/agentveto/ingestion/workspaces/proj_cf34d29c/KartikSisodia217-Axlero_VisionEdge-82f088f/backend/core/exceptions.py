from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.schemas.response import ErrorResponse


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        response = ErrorResponse(
            message="Internal Server Error",
            error=str(exc),
        )

        return JSONResponse(
            status_code=500,
            content=response.model_dump(),
        )