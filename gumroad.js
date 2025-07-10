const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
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
    // Insert user into MongoDB
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

    // Generate JWT login token
    const token = jwt.sign(
      {
        email,
        plan,
        full_name
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // Create personalized dashboard login link
    const dashboardLink = `https://ff-smart-scheduler.web.app/login/${token}`;

    // (Optional) Send to frontend or email — for now we’ll log it
    console.log(`🔗 Dashboard access: ${dashboardLink}`);

    res.status(200).send('Webhook received and processed.');
  } catch (error) {
    console.error('❌ Error saving purchase to DB:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
