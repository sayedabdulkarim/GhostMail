const net = require('net');

const recipient = process.argv[2] || '603afe204dfe@ghostmail.local';
const username = recipient.split('@')[0];

console.log(`Sending test email to: ${recipient}\n`);

const client = net.createConnection({ port: 2525, host: 'localhost' }, () => {
  console.log('Connected to SMTP server');
});

let step = 0;
const commands = [
  'EHLO localhost\r\n',
  'MAIL FROM:<test@example.com>\r\n',
  `RCPT TO:<${recipient}>\r\n`,
  'DATA\r\n',
  `From: Test Sender <test@example.com>\r\n` +
  `To: ${recipient}\r\n` +
  `Subject: Welcome to GhostMail!\r\n` +
  `Date: ${new Date().toUTCString()}\r\n` +
  `Content-Type: text/html; charset=utf-8\r\n` +
  `\r\n` +
  `<h2>Hello from GhostMail!</h2>\r\n` +
  `<p>This is a <strong>test email</strong> to verify your disposable email service is working.</p>\r\n` +
  `<p>Features:</p>\r\n` +
  `<ul>\r\n` +
  `<li>Real-time email delivery</li>\r\n` +
  `<li>Auto-delete after 1 hour</li>\r\n` +
  `<li>No registration needed</li>\r\n` +
  `</ul>\r\n` +
  `<p>Enjoy! 👻</p>\r\n` +
  `\r\n.\r\n`,
  'QUIT\r\n'
];

client.on('data', (data) => {
  const response = data.toString().trim();
  console.log('Server:', response);

  if (step < commands.length) {
    const cmd = commands[step];
    console.log('Client:', cmd.substring(0, 50) + (cmd.length > 50 ? '...' : ''));
    client.write(cmd);
    step++;
  }
});

client.on('end', () => {
  console.log('\n✅ Email sent! Check your browser.');
});

client.on('error', (err) => {
  console.error('Error:', err.message);
});
