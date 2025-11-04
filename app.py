from flask import Flask, jsonify, request, render_template
from SemanticSearch import fetchInfo

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route('/getResponse', methods=['POST'])
def getResponse():
    data = request.get_json()
    userQuery = data.get('userQuery')
    result = fetchInfo(userQuery)
    return jsonify({'userQuery': result})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)

