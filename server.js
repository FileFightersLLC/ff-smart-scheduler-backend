const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer'); // add nodemailer
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure your SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // example for Gmail SMTP
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email, set as environment variable
    pass: process.env.EMAIL_PASS  // your email app password or SMTP password
  }
});

// Route to accept bookings and send email
app.post('/api/bookings', async (req, res) => {
  const booking = req.body;
  console.log('📬 New Booking Received:', booking);

  const mailOptions = {
    from: `"FF SmartScheduler" <${process.env.EMAIL_USER}>`, // sender address
    to: booking.agentEmail, // receiver (agent)
    subject: `New Booking from ${booking.clientName} - ${booking.appointmentType}`,
    text: `
New appointment booking details:

Agent: ${booking.agent}
Appointment Type: ${booking.appointmentType}
Duration: ${booking.appointmentDuration}

Client Name: ${booking.clientName}
Client Email: ${booking.clientEmail}
Client Phone: ${booking.clientPhone}
Message: ${booking.clientMessage || 'No message provided'}

Submitted At: ${booking.submittedAt}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Booking received and email sent to agent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Booking received but failed to send email.' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('FF SmartScheduler Backend is running.');
});

app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
