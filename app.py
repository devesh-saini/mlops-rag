from flask import Flask, jsonify, request, render_template
from ollama import Client

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/getResponse", methods=["GET"])
def getResponse():
    userQuery = request.form['userQuery']
    print(userQuery)
    return userQuery

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)

