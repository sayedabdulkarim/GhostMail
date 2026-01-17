const cron = require('node-cron');
const Email = require('../models/Email');

const startCleanupJob = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expiryHours = parseInt(process.env.EMAIL_EXPIRY_HOURS) || 1;
      const expiryDate = new Date(Date.now() - expiryHours * 60 * 60 * 1000);

      const result = await Email.deleteMany({
        createdAt: { $lt: expiryDate }
      });

      if (result.deletedCount > 0) {
        console.log(`Cleanup: Deleted ${result.deletedCount} expired emails`);
      }
    } catch (error) {
      console.error('Cleanup job error:', error);
    }
  });

  console.log('Cleanup job scheduled (every 5 minutes)');
};

module.exports = startCleanupJob;
