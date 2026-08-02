# Use official Python runtime as a parent image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies (Tesseract OCR & Poppler for PDF extraction)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to the root where 'backend' module lives
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create the backend directory inside the container
RUN mkdir -p /app/backend

# Copy the current directory contents into the /app/backend directory
COPY . /app/backend/

# Expose port
EXPOSE 8000

# Set Python Path so it can resolve 'backend.main'
ENV PYTHONPATH=/app

# Run Alembic migrations and then start Uvicorn
CMD cd backend && alembic upgrade head && cd .. && uvicorn backend.main:app --host 0.0.0.0 --port 8000
