const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const crypto = require('crypto');

// Get domain
router.get('/domain', (req, res) => {
  res.json({ domain: process.env.DOMAIN });
});

// Generate random email address
router.post('/generate', (req, res) => {
  const randomString = crypto.randomBytes(6).toString('hex');
  const email = `${randomString}@${process.env.DOMAIN}`;
  res.json({ email, username: randomString });
});

// Get all emails for a username
router.get('/inbox/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const emails = await Email.find({ username: username.toLowerCase() })
      .select('-html -text -attachments')
      .sort({ createdAt: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single email by ID
router.get('/email/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    // Mark as read
    if (!email.read) {
      email.read = true;
      await email.save();
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete email by ID
router.delete('/email/:id', async (req, res) => {
  try {
    const email = await Email.findByIdAndDelete(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json({ message: 'Email deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all emails for a username
router.delete('/inbox/:username', async (req, res) => {
  try {
    const { username } = req.params;
    await Email.deleteMany({ username: username.toLowerCase() });
    res.json({ message: 'Inbox cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
