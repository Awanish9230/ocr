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

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Expose port
EXPOSE 8000

# Set Python Path
ENV PYTHONPATH=/

# Run Alembic migrations and then start Uvicorn
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000
