from flask import Flask, jsonify, request, render_template, Response
from langchain_ollama import ChatOllama

app = Flask(__name__)

try:
    model = ChatOllama(
        model='deveshsainipro/dev-persona',
        temperature=0.2
    )
    print("Ollama model initialized successfully.")
except Exception as e:
    print(f"Error initializing Ollama model: {e}")
    model = None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/getResponse", methods=["POST"])
def getResponse():
    if model is None:
        return jsonify({"error": "Model is not initialized."}), 500

    data = request.json
    userQuery = data.get('userQuery')

    if not userQuery:
        return jsonify({"error": "No userQuery provided."}), 400

    print(f"Received query: {userQuery}")

    def stream_generator(query):
        """A generator function to stream the model's response."""
        try:
            for chunk in model.stream(query):
                if chunk.content:
                    yield chunk.content
        except Exception as e:
            print(f"Error during model streaming: {e}")
            yield "Sorry, an error occurred while generating the response."

    return Response(stream_generator(userQuery), mimetype='text/plain')


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)
