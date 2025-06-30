const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure your SMTP transporter (example uses Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // Your email (set in Render environment variables)
    pass: process.env.EMAIL_PASS      // Your app password or email password (set in Render environment variables)
  }
});

// Route to accept bookings and send email
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  console.log('📬 New Booking Received:', booking);

  const mailOptions = {
    from: `"FF SmartScheduler" <${process.env.EMAIL_USER}>`,  // sender address
    to: booking.agentEmail,                                   // recipient (agent email)
    subject: `New Appointment Request from ${booking.clientName}`,
    text: `
You have a new booking request:

Appointment Type: ${booking.appointmentType}
Duration: ${booking.appointmentDuration}

Client Details:
Name: ${booking.clientName}
Email: ${booking.clientEmail}
Phone: ${booking.clientPhone}
Message: ${booking.clientMessage || 'No additional message.'}

Submitted At: ${booking.submittedAt}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send booking email.' });
    }
    console.log('✅ Email sent: ' + info.response);
    res.json({ message: 'Booking received and email sent successfully!' });
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('FF SmartScheduler Backend is running.');
});

app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
