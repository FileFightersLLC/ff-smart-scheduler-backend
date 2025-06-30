const express = require('express');
const router = express.Router();

router.post('/gumroad', (req, res) => {
  const {
    email,  // ✅ FIXED: Correct Gumroad field
    product_name = '',
    full_name,
    price,
    sale_id,
    product_permalink = ''
  } = req.body;

  // Normalize and detect plan tier
  let plan = 'starter'; // default fallback

  const name = product_name.toLowerCase();
  const link = product_permalink.toLowerCase();

  if (name.includes('enterprise') || link.includes('enterprise')) {
    plan = 'enterprise';
  } else if (name.includes('professional') || link.includes('professional')) {
    plan = 'professional';
  }

  // Log with plan
  console.log('✅ Gumroad Webhook Received:', {
    email,
    full_name,
    product_name,
    price,
    sale_id,
    plan
  });

  // Step 2: store this in the DB

  res.status(200).send('Webhook received.');
});

module.exports = router;
