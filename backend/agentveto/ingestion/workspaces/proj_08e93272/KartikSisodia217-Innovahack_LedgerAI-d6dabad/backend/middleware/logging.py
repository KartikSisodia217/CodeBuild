import uuid
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from backend.observability.logger import logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        
        # Add request_id to state
        request.state.request_id = request_id
        
        logger.info(f"Incoming request: {request.method} {request.url.path} [ID: {request_id}]")
        
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        
        response.headers["X-Request-ID"] = request_id
        
        logger.info(
            f"Completed request: {request.method} {request.url.path} "
            f"[ID: {request_id}] - Status: {response.status_code} - {process_time:.2f}ms"
        )
        
        return response
