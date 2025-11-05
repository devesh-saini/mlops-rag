from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/getResponse", methods=["POST"])
def getResponse():
    if request.method == "POST":
        userQuery = request.form['userQuery']
        print(f"{userQuery}")
        return "Hello."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)

