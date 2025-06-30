const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route to accept bookings
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  console.log('📬 New Booking Received:', booking);

  // In real app: save to database or send email
  res.json({ message: 'Booking received successfully!' });
});

// Health check
app.get('/', (req, res) => {
  res.send('FF SmartScheduler Backend is running.');
});

app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
