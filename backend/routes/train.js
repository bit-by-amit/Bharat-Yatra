const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const TRAINS_FILE = path.join(__dirname, '../data/trains.json');

function readTrains() {
  const data = fs.readFileSync(TRAINS_FILE);
  return JSON.parse(data);
}

function writeTrains(trains) {
  fs.writeFileSync(TRAINS_FILE, JSON.stringify(trains, null, 2));
}

// GET all trains
router.get('/trains', (req, res) => {
  const trains = readTrains();
  res.json(trains);
});

// POST new train (Admin use)
router.post('/add-train', (req, res) => {
  const train = req.body;
  const trains = readTrains();

  train.id = Date.now();
  trains.push(train);

  writeTrains(trains);
  res.json({ success: true, train });
});

// Search train (by from, to, date)
router.post('/search', (req, res) => {
  const { from, to, date } = req.body;
  const trains = readTrains();

  const results = trains.filter(t =>
    t.from.toLowerCase() === from.toLowerCase() &&
    t.to.toLowerCase() === to.toLowerCase() &&
    t.date === date
  );

  res.json(results);
});

module.exports = router;
