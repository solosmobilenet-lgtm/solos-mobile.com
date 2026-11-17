
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Create storage folder and file if they don't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf8');
}

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Read saved bookings
function readBookings() {
  try {
    return JSON.parse(
      fs.readFileSync(BOOKINGS_FILE, 'utf8')
    );
  } catch {
    return [];
  }
}

// Clean customer input
function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Receive repair booking
app.post('/api/bookings', (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email).toLowerCase();
  const phone = clean(req.body.phone);
  const device = clean(req.body.device);
  const service = clean(req.body.service);
  const preferredDate = clean(req.body.preferredDate);
  const message = clean(req.body.message);

  if (!name || !email || !phone || !device || !service) {
    return res.status(400).json({
      message: 'Please complete all required fields.'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: 'Please enter a valid email address.'
    });
  }

  if (
    name.length > 100 ||
    email.length > 150 ||
    phone.length > 40 ||
    device.length > 100 ||
    service.length > 100 ||
    message.length > 1500
  ) {
    return res.status(400).json({
      message: 'One or more fields are too long.'
    });
  }

  const bookings = readBookings();

  const booking = {
    id: `SM-${Date.now()}-${Math.random()
      .toString(36).slice(2, 7).toUpperCase()}`,
    name,
    email,
    phone,
    device,
    service,
    preferredDate,
    message,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(booking);

  fs.writeFileSync(
    BOOKINGS_FILE,
    JSON.stringify(bookings, null, 2),
    'utf8'
  );

  return res.status(201).json({
    message: 'Your repair request has been received.',
    bookingId: booking.id
  });
});

// Backend health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Solos Mobile API'
  });
});

// Display homepage
app.get('*', (_req, res) => {
  res.sendFile(
    path.join(__dirname, 'public', 'index.html')
  );
});

app.listen(PORT, () => {
  console.log(
    `Solos Mobile is running at http://localhost:${PORT}`
  );
});
