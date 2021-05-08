const express = require("express");
const mongo = require("mongodb").MongoClient;

const app = express();
const url = "mongodb://localhost:27017";

app.use(express.json());

let db, trips, expenses;

mongo.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }
  db = client.db("tripCost");
  trips = db.collection("trips");
  expenses = db.collection("expenses");
  console.log("Databases  ready");
});

app.post("/trip", async (req, res) => {
  const { name } = req.body;

  try {
    const trip = await trips.insertOne({ name });
    res.status(200).send(trip.ops);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.get("/trips", async (req, res) => {
  try {
    const tripsList = await trips.find().toArray();
    res.status(200).json(tripsList);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.post("/expense", async (req, res) => {
  const { trip, date, amount, category, description } = req.body;
  try {
    const expense = await expenses.insertOne({ trip, date, amount, category, description });
    res.status(200).send(expense.ops);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/expenses", async (req, res) => {
  const { tripId } = req.body;

  try {
    const trip = await expenses.find({ trip: tripId }).toArray();

    res.status(200).json(trip);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.listen(3000, () => console.log("Server ready"));
