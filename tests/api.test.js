const request = require('supertest');
const mongoose = require('mongoose');
const Email = require('../server/models/Email');
const { createTestApp, connectTestDB, cleanup } = require('./setup');

let app;

beforeAll(async () => {
  await connectTestDB();
  ({ app } = createTestApp());
});

afterAll(async () => {
  await cleanup();
});

afterEach(async () => {
  await Email.deleteMany({ username: /^test/ });
});

describe('GET /api/domain', () => {
  it('should return the configured domain', async () => {
    const res = await request(app).get('/api/domain');
    expect(res.status).toBe(200);
    expect(res.body.domain).toBeDefined();
    expect(typeof res.body.domain).toBe('string');
  });
});

describe('POST /api/generate', () => {
  it('should generate a random email address', async () => {
    const res = await request(app).post('/api/generate');
    expect(res.status).toBe(200);
    expect(res.body.email).toContain('@');
    expect(res.body.username).toBeDefined();
    expect(res.body.username.length).toBe(12); // 6 bytes = 12 hex chars
  });

  it('should generate unique emails each time', async () => {
    const res1 = await request(app).post('/api/generate');
    const res2 = await request(app).post('/api/generate');
    expect(res1.body.email).not.toBe(res2.body.email);
  });
});

describe('GET /api/inbox/:username', () => {
  it('should return empty array for new username', async () => {
    const res = await request(app).get('/api/inbox/testuser123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return emails for existing username', async () => {
    await Email.create({
      to: 'testinbox@test.com',
      username: 'testinbox',
      from: 'sender@example.com',
      subject: 'Hello Test'
    });

    const res = await request(app).get('/api/inbox/testinbox');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].subject).toBe('Hello Test');
  });

  it('should reject invalid username', async () => {
    const res = await request(app).get('/api/inbox/ab'); // too short
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid username');
  });

  it('should reject username with special chars', async () => {
    const res = await request(app).get('/api/inbox/test<script>');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/email/:id', () => {
  it('should return a single email by ID', async () => {
    const email = await Email.create({
      to: 'testsingle@test.com',
      username: 'testsingle',
      from: 'sender@example.com',
      subject: 'Single Email',
      text: 'Body text here'
    });

    const res = await request(app).get(`/api/email/${email._id}`);
    expect(res.status).toBe(200);
    expect(res.body.subject).toBe('Single Email');
    expect(res.body.text).toBe('Body text here');
  });

  it('should mark email as read', async () => {
    const email = await Email.create({
      to: 'testread@test.com',
      username: 'testread',
      from: 'sender@example.com',
      subject: 'Read Test'
    });

    expect(email.read).toBe(false);
    await request(app).get(`/api/email/${email._id}`);
    const updated = await Email.findById(email._id);
    expect(updated.read).toBe(true);
  });

  it('should return 404 for non-existent email', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/email/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/email/:id', () => {
  it('should delete a single email', async () => {
    const email = await Email.create({
      to: 'testdelete@test.com',
      username: 'testdelete',
      from: 'sender@example.com',
      subject: 'Delete Me'
    });

    const res = await request(app).delete(`/api/email/${email._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Email deleted');

    const found = await Email.findById(email._id);
    expect(found).toBeNull();
  });

  it('should return 404 for non-existent email', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/email/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/inbox/:username', () => {
  it('should clear all emails for a username', async () => {
    await Email.create([
      { to: 'testclear@test.com', username: 'testclear', from: 'a@b.com', subject: 'One' },
      { to: 'testclear@test.com', username: 'testclear', from: 'a@b.com', subject: 'Two' }
    ]);

    const res = await request(app).delete('/api/inbox/testclear');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Inbox cleared');

    const remaining = await Email.find({ username: 'testclear' });
    expect(remaining.length).toBe(0);
  });

  it('should reject invalid username', async () => {
    const res = await request(app).delete('/api/inbox/x!');
    expect(res.status).toBe(400);
  });
});
