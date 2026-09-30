from flask import Flask, jsonify, request

app = Flask(__name__)

cars = [
    {
        "id": 1,
        "name": "Fiat Egea",
        "model": 2021,
        "transmission": "Otomatik",
        "fuel": "Dizel",
        "price": 1800
    },
    {
        "id": 2,
        "name": "Renault Symbol",
        "model": 2021,
        "transmission": "Manuel",
        "fuel": "Benzin",
        "price": 1800
    },
    {
        "id": 3,
        "name": "Dacia Duster",
        "model": 2024,
        "transmission": "Manuel",
        "fuel": "Dizel",
        "price": 1800
    }
]

@app.route("/")
def home():
    return jsonify({
        "status": "ok",
        "message": "Uzel Prestij Garaj API çalışıyor"
    })

@app.route("/api/cars", methods=["GET"])
def get_cars():
    return jsonify(cars)

@app.route("/api/cars", methods=["POST"])
def add_car():
    data = request.json

    new_car = {
        "id": len(cars) + 1,
        "name": data.get("name"),
        "model": data.get("model"),
        "transmission": data.get("transmission"),
        "fuel": data.get("fuel"),
        "price": data.get("price")
    }

    cars.append(new_car)

    return jsonify({
        "success": True,
        "car": new_car
    }), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)