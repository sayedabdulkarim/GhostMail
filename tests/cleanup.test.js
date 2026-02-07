const mongoose = require('mongoose');
const Email = require('../server/models/Email');
const { connectTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await Email.deleteMany({ username: /^cleanuptest/ });
  await mongoose.connection.close();
});

describe('Email Cleanup', () => {
  it('should delete emails older than expiry time', async () => {
    const expiryHours = parseInt(process.env.EMAIL_EXPIRY_HOURS) || 1;

    // Create an old email (2 hours ago)
    await Email.create({
      to: 'cleanuptest01@test.com',
      username: 'cleanuptest01',
      from: 'sender@test.com',
      subject: 'Old Email',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    });

    // Create a fresh email (just now)
    await Email.create({
      to: 'cleanuptest02@test.com',
      username: 'cleanuptest02',
      from: 'sender@test.com',
      subject: 'Fresh Email'
    });

    // Run the same cleanup logic as the cron job
    const expiryDate = new Date(Date.now() - expiryHours * 60 * 60 * 1000);
    const result = await Email.deleteMany({ createdAt: { $lt: expiryDate } });

    expect(result.deletedCount).toBeGreaterThanOrEqual(1);

    // Old email should be gone
    const oldEmail = await Email.findOne({ username: 'cleanuptest01' });
    expect(oldEmail).toBeNull();

    // Fresh email should still exist
    const freshEmail = await Email.findOne({ username: 'cleanuptest02' });
    expect(freshEmail).not.toBeNull();
    expect(freshEmail.subject).toBe('Fresh Email');
  });

  it('should have TTL index on createdAt field', async () => {
    const indexes = await Email.collection.indexes();
    const ttlIndex = indexes.find(
      (idx) => idx.key && idx.key.createdAt === 1 && idx.expireAfterSeconds !== undefined
    );
    expect(ttlIndex).toBeDefined();
    expect(ttlIndex.expireAfterSeconds).toBe(3600);
  });
});
