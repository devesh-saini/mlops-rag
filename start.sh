#!/bin/bash

/usr/local/bin/ollama serve &

echo "Waiting for Ollama to start..."
while ! curl -s http://127.0.0.1:11434 > /dev/null; do
    sleep 1
done
echo "Ollama is up!"

echo "Pulling model 'deveshsainipro/dev-persona'..."
ollama pull deveshsainipro/dev-persona
echo "Model pull complete."

echo "Starting Flask app..."
flask run --host=0.0.0.0 --port=7860
