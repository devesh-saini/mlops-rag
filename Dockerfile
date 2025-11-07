FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl

RUN curl -fsSL https://ollama.com/install.sh | sh

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x /app/start.sh

EXPOSE 7860

CMD ["/app/start.sh"]
