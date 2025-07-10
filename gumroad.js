const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

const emailSender = process.env.EMAIL_SENDER;
const emailPassword = process.env.EMAIL_PASSWORD;

const client = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db('SmartSchedulerDB');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}
connectDB();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailSender,
    pass: emailPassword
  }
});

router.post('/gumroad', async (req, res) => {
  const {
    email,
    product_name,
    price,
    sale_id,
    custom_fields = {}
  } = req.body;

  const full_name = custom_fields.Full_Name || 'Not provided';

  // Determine plan type
  let plan = 'starter';
  if (price === '8900') plan = 'professional';
  else if (price === '14900') plan = 'enterprise';

  console.log('✅ Gumroad Webhook Received:', {
    email,
    full_name,
    product_name,
    price,
    sale_id,
    plan
  });

  try {
    // Insert into DB
    const purchaseData = {
      email,
      full_name,
      product_name,
      price,
      sale_id,
      plan,
      createdAt: new Date()
    };

    const result = await db.collection('purchases').insertOne(purchaseData);
    console.log(`✅ Purchase saved with _id: ${result.insertedId}`);

    // Create JWT and dashboard link
    const token = jwt.sign(
      { email, plan, full_name },
      jwtSecret,
      { expiresIn: '1h' }
    );
    const dashboardLink = `https://ff-smart-scheduler.web.app/login/${token}`;
    console.log(`🔗 Dashboard access: ${dashboardLink}`);

    // Send email with dashboard link
    await transporter.sendMail({
      from: `"FF SmartScheduler" <${emailSender}>`,
      to: email,
      subject: 'Your FF SmartScheduler Dashboard Access',
      html: `
        <p>Hi ${full_name},</p>
        <p>Thanks for purchasing <strong>${product_name}</strong>!</p>
        <p>Your dashboard is ready. Click the link below to access it and customize your booking page:</p>
        <p><a href="${dashboardLink}">${dashboardLink}</a></p>
        <p>— FileFighters LLC</p>
      `
    });

    console.log(`📧 Email sent to ${email}`);
    res.status(200).send('Webhook received and processed.');
  } catch (error) {
    console.error('❌ Error saving purchase or sending email:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
