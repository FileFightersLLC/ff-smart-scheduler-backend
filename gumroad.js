const express = require('express');
const router = express.Router();

router.post('/gumroad', (req, res) => {
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

  // TODO: Store in database or activate account access here

  res.status(200).send('Webhook received.');
});

module.exports = router;
