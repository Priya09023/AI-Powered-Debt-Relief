from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, message: str, code: int = 400):
        self.message = message
        self.code = code


async def app_exception_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.code,
        content={"error": exc.message, "status_code": exc.code},
    )


def not_found(detail: str = "Resource not found"):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def bad_request(detail: str = "Bad request"):
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def unauthorized(detail: str = "Not authenticated"):
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def forbidden(detail: str = "Not authorized"):
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
