const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

// Load environment variables
const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-with-a-secure-secret';

const client = new MongoClient(uri);

let db;

// Connect to MongoDB once when the module loads
async function connectDB() {
  try {
    await client.connect();
    db = client.db('SmartSchedulerDB'); // Use your DB name here
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}
connectDB();

// Handle Gumroad Webhook
router.post('/gumroad', async (req, res) => {
  const {
    email,               // From Gumroad webhook
    product_name,        // e.g. "FF SmartScheduler"
    price,               // e.g. "8900"
    sale_id,             // Unique sale identifier
    custom_fields = {}   // e.g. { Full_Name: "John Doe" }
  } = req.body;

  // Extract full name or fallback
  const full_name = custom_fields.Full_Name || 'Not provided';

  // Determine plan based on price
  let plan = 'starter';
  if (price === '8900') plan = 'professional';
  else if (price === '14900') plan = 'enterprise';

  // ✅ Generate JWT token for secure login
  const token = jwt.sign({ email, plan }, JWT_SECRET, { expiresIn: '30d' });

  // Log webhook receipt
  console.log('✅ Gumroad Webhook Received:', {
    email,
    full_name,
    product_name,
    price,
    sale_id,
    plan
  });

  // Store purchase in MongoDB
  try {
    const purchaseData = {
      email,
      full_name,
      product_name,
      price,
      sale_id,
      plan,
      token,
      custom_fields,
      receivedAt: new Date(),
    };

    const result = await db.collection('purchases').insertOne(purchaseData);
    console.log(`✅ Purchase saved with _id: ${result.insertedId}`);
    console.log(`🔗 Login URL: https://ff-smart-scheduler-backend.onrender.com/login/${token}`);

    res.status(200).send('Webhook received and processed.');
  } catch (error) {
    console.error('❌ Error saving purchase to DB:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
