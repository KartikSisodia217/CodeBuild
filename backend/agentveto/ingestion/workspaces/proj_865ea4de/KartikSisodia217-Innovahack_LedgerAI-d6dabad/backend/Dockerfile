FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

WORKDIR /app

# Install system dependencies needed for compiling packages like psycopg2 and general checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    tesseract-ocr \
    tesseract-ocr-eng \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python requirements
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY ./backend /app/backend
COPY ./alembic.ini /app/

# Expose port
EXPOSE 8000

# Ensure line endings are LF and script is executable
RUN sed -i 's/\r$//' /app/backend/scripts/start.sh && chmod +x /app/backend/scripts/start.sh

# Command to run the app using the startup script
CMD ["/app/backend/scripts/start.sh"]
