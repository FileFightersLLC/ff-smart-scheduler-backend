const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

const jwt = require('jsonwebtoken');

app.post('/api/verify-token', (req, res) => {
  const { token } = req.body;
  const secret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret);
    res.status(200).json({
      email: decoded.email,
      plan: decoded.plan,
      full_name: decoded.full_name
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});


// Middleware
app.use(cors());
app.use(express.json());

// Email transporter setup (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address from Render ENV
    pass: process.env.EMAIL_PASS  // Your Gmail app password from Render ENV
  }
});

// Route to accept bookings and send email
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  console.log('📬 New Booking Received:', booking);

  const mailOptions = {
    from: `"FF SmartScheduler" <${process.env.EMAIL_USER}>`,
    to: booking.agentEmail, // The realtor's email from the form
    subject: `📅 New Booking from ${booking.clientName}`,
    text: `
---
DO NOT REPLY to this email.
---

You have received a new booking request:

--- Appointment Details ---
Type: ${booking.appointmentType}
Duration: ${booking.appointmentDuration}

--- Client Info ---
Name: ${booking.clientName}
Email: ${booking.clientEmail}
Phone: ${booking.clientPhone}
Message: ${booking.clientMessage || 'No message provided.'}

Submitted At: ${booking.submittedAt || new Date().toLocaleString()}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email send error:', error);
      return res.status(500).json({ message: 'Failed to send email.' });
    }

    console.log('✅ Email sent:', info.response);
    res.json({ message: 'Booking received and email sent successfully!' });
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('FF SmartScheduler Backend is running.');
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
