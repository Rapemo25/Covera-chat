from flask import Flask, jsonify, request

app = Flask(__name__)

# Sample data
data = {
    "message": "Hello, World!"
}

# API endpoint to get data
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(data)

# API endpoint to update data
@app.route('/api/data', methods=['POST'])
def update_data():
    new_data = request.json
    data.update(new_data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
