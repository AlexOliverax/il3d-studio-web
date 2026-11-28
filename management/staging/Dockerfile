FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY management/requirements.txt management/requirements.txt
COPY management/staging/requirements.txt management/staging/requirements.txt
RUN pip install --no-cache-dir -r management/staging/requirements.txt
COPY management /app/management
USER 1000:1000
EXPOSE 8000
CMD ["gunicorn", "--bind=0.0.0.0:8000", "--workers=1", "--threads=4", "--umask=0077", "--worker-tmp-dir=/tmp", "management.app:create_app()"]
