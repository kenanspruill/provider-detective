FROM public.ecr.aws/docker/library/python:3.12-alpine3.21 AS build
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app
RUN apk add --no-cache build-base
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

FROM public.ecr.aws/docker/library/python:3.12-alpine3.21-slim
WORKDIR /app
RUN addgroup --system appuser && \
    adduser --system --ingroup appuser appuser
COPY --from=build /app /app
COPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
USER appuser
EXPOSE 8000
CMD ["python", "app.py"]]