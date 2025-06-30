const express = require('express');
const router = express.Router();

router.post('/gumroad', (req, res) => {
  const {
    purchaser_email,
    product_name,
    full_name,
    price,
    sale_id
  } = req.body;

  console.log('✅ Gumroad Webhook Received:', {
    purchaser_email,
    product_name,
    full_name,
    price,
    sale_id
  });

  // Step 2 will store this in the DB

  res.status(200).send('Webhook received.');
});

module.exports = router;
