const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  process.exit(1); // Stop app startup, must fix config
}

const client = new MongoClient(uri);

let db;

// Connect once on module load
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

router.post('/gumroad', async (req, res) => {
  if (!db) {
    return res.status(503).send('Database not connected yet, try again shortly.');
  }

  const {
    email = 'Not provided',
    product_name = 'Unknown product',
    price = '',
    sale_id = 'Unknown sale ID',
    custom_fields = {},
  } = req.body || {};

  // Get full name from custom fields (make sure you added this in Gumroad product settings)
  const full_name = custom_fields.Full_Name || 'Not provided';

  // Determine plan type based on price (strings)
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

  const purchaseData = {
    email,
    full_name,
    product_name,
    price,
    sale_id,
    plan,
    custom_fields,
    receivedAt: new Date(),
  };

  try {
    const result = await db.collection('purchases').insertOne(purchaseData);
    console.log(`✅ Purchase saved with _id: ${result.insertedId}`);
    res.status(200).send('Webhook received and processed.');
  } catch (error) {
    console.error('❌ Error saving purchase to DB:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
