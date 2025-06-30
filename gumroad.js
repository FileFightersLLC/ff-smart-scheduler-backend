const express = require('express');
const router = express.Router();

router.post('/gumroad', (req, res) => {
  const {
    email,         // Correct field from Gumroad
    full_name,     // Optional but usually included
    product_name,
    price,
    sale_id
  } = req.body;

  // Determine plan type based on price
  let plan = 'starter'; // default plan
  if (price === '8900') {
    plan = 'professional';
  } else if (price === '14900') {
    plan = 'enterprise';
  }

  console.log('✅ Gumroad Webhook Received:', {
    email,
    full_name,
    product_name,
    price,
    sale_id,
    plan
  });

  // Step 2: Save this info to a database or trigger plan activation here

  res.status(200).send('Webhook received.');
});

module.exports = router;
