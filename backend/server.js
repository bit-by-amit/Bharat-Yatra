const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // serve HTML/CSS/JS files from public/

// Data file paths
const trainsPath = path.join(__dirname, 'data', 'trains.json');
const bookingsPath = path.join(__dirname, 'data', 'bookings.json');

// -----------------------------------
// 🚆 ADD TRAIN (ADMIN PAGE FORM POST)
// -----------------------------------
app.post('/add-train', (req, res) => {
  const trains = JSON.parse(fs.readFileSync(trainsPath));
  const newTrain = {
    id: Date.now(),
    ...req.body
  };
  trains.push(newTrain);
  fs.writeFileSync(trainsPath, JSON.stringify(trains, null, 2));
  res.send(`<h2>Train added successfully!</h2><a href="/admin-add-train.html">Back</a>`);
});

// -----------------------------------
// 🔍 SEARCH TRAINS (FROM SEARCH FORM)
// -----------------------------------
app.post('/search-trains', (req, res) => {
  const { from, to, date } = req.body;
  const trains = JSON.parse(fs.readFileSync(trainsPath));

  const matched = trains.filter(train =>
    train.from.toLowerCase() === from.toLowerCase() &&
    train.to.toLowerCase() === to.toLowerCase() &&
    train.date === date
  );

  if (matched.length === 0) {
    return res.send("<h2>No trains found.</h2><a href='/search-trains.html'>Back</a>");
  }

  let resultHTML = `<h2>Matching Trains</h2><ul>`;
  matched.forEach(train => {
    resultHTML += `
      <li>
        <strong>${train.trainName}</strong> (${train.trainNumber}) - ₹${train.fare}
        <form action="/book-ticket" method="GET" style="display:inline">
          <input type="hidden" name="trainId" value="${train.id}">
          <button type="submit">Book Now</button>
        </form>
      </li>
    `;
  });
  resultHTML += `</ul><a href='/search-trains.html'>Back</a>`;

  res.send(resultHTML);
});

// -----------------------------------
// 🎫 SHOW BOOKING FORM FOR SELECTED TRAIN
// -----------------------------------
app.get('/book-ticket', (req, res) => {
  const trainId = req.query.trainId;
  const trains = JSON.parse(fs.readFileSync(trainsPath));
  const train = trains.find(t => t.id == trainId);

  if (!train) return res.send("Train not found");

  res.send(`
    <h2>Book Ticket for ${train.trainName}</h2>
    <form action="/book-ticket" method="POST">
      <input type="hidden" name="trainId" value="${train.id}">
      <input type="hidden" name="fare" value="${train.fare}">
      <label>Passenger Name: <input name="name" required></label><br>
      <label>Age: <input name="age" required></label><br>
      <label>Gender:
        <select name="gender">
          <option>Male</option>
          <option>Female</option>
        </select>
      </label><br>
      <label>Seats: <input name="seats" type="number" value="1" min="1" required></label><br>
      <button type="submit">Confirm Booking</button>
    </form>
  `);
});

// -----------------------------------
// 🎫 PROCESS TICKET BOOKING & GENERATE PNR
// -----------------------------------
app.post('/book-ticket', (req, res) => {
  const { trainId, name, age, gender, seats, fare } = req.body;
  const bookings = JSON.parse(fs.readFileSync(bookingsPath));
  const trains = JSON.parse(fs.readFileSync(trainsPath));
  const train = trains.find(t => t.id == trainId);

  if (!train) return res.send("Train not found");

  const totalFare = parseInt(fare) * parseInt(seats);
  const pnr = "PNR" + Math.floor(100000 + Math.random() * 900000);

  const booking = {
    id: Date.now(),
    pnr,
    trainId,
    trainName: train.trainName,
    passenger: { name, age, gender },
    seats: parseInt(seats),
    totalFare,
    date: train.date
  };

  bookings.push(booking);
  fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));

  res.send(`<h2>Booking Confirmed!</h2><p>Your PNR: <strong>${pnr}</strong></p><a href='/search-trains.html'>Search More</a>`);
});

// -----------------------------------
// 🚀 START THE SERVER
// -----------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
