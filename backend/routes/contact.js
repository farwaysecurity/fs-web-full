const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  console.log('Contact form submission:', { name, email, subject, message });
  res.json({ success: true, message: "Your message has been received. We'll get back to you shortly." });
});

module.exports = router;
