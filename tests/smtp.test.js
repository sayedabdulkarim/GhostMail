const net = require('net');
const Email = require('../server/models/Email');
const { createTestApp, connectTestDB, startTestSMTP, cleanup } = require('./setup');

const SMTP_PORT = 2526;

const sendTestEmail = (to, from, subject, body) => {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(SMTP_PORT, '127.0.0.1', () => {});
    let step = 0;

    const commands = [
      `EHLO test.com\r\n`,
      `MAIL FROM:<${from}>\r\n`,
      `RCPT TO:<${to}>\r\n`,
      `DATA\r\n`,
      `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n${body}\r\n.\r\n`,
      `QUIT\r\n`
    ];

    client.on('data', (data) => {
      const response = data.toString();
      if (step < commands.length) {
        client.write(commands[step]);
        step++;
      }
      if (response.startsWith('221') || step >= commands.length) {
        client.end();
        resolve();
      }
    });

    client.on('error', reject);
    client.setTimeout(5000, () => {
      client.destroy();
      reject(new Error('SMTP timeout'));
    });
  });
};

beforeAll(async () => {
  await connectTestDB();
  createTestApp();
  await startTestSMTP(SMTP_PORT);
});

afterAll(async () => {
  await Email.deleteMany({ username: /^smtptest/ });
  await cleanup();
});

describe('SMTP Server', () => {
  it('should receive and save an email', async () => {
    const to = 'smtptest001@test.com';
    const from = 'sender@example.com';
    const subject = 'SMTP Test Email';
    const body = 'This is a test email body';

    await sendTestEmail(to, from, subject, body);

    // Wait for email to be processed and saved
    await new Promise((r) => setTimeout(r, 1000));

    const emails = await Email.find({ username: 'smtptest001' });
    expect(emails.length).toBe(1);
    expect(emails[0].from).toBe(from);
    expect(emails[0].subject).toBe(subject);
  });

  it('should save username in lowercase', async () => {
    const to = 'SMTPTestUpper@test.com';
    const from = 'sender@example.com';

    await sendTestEmail(to, from, 'Case Test', 'body');
    await new Promise((r) => setTimeout(r, 1000));

    const emails = await Email.find({ username: 'smtptestupper' });
    expect(emails.length).toBe(1);
  });
});
