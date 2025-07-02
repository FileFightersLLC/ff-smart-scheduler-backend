const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
  const {
    email,               // Gumroad webhook sends this
    product_name,        // e.g., "FF SmartScheduler"
    price,               // e.g., "8900"
    sale_id,             // unique ID for this transaction
    custom_fields = {}   // your custom fields like full_name
  } = req.body;

  // Get full name from custom fields (make sure you added this in Gumroad product settings)
  const full_name = custom_fields.Full_Name || 'Not provided';

  // Determine plan type based on price
  let plan = 'starter';
  if (price === '8900') plan = 'professional';
  else if (price === '14900') plan = 'enterprise';

  // Log the purchase
  console.log('✅ Gumroad Webhook Received:', {
    email,
    full_name,
    product_name,
    price,
    sale_id,
    plan
  });

  // Insert purchase into MongoDB
  try {
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

    const result = await db.collection('purchases').insertOne(purchaseData);
    console.log(`✅ Purchase saved with _id: ${result.insertedId}`);

    res.status(200).send('Webhook received and processed.');
  } catch (error) {
    console.error('❌ Error saving purchase to DB:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
