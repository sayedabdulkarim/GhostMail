const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const Email = require('../models/Email');

let io = null;

// Simple rate limiter: max 10 connections per minute per IP
const smtpConnections = new Map();
const SMTP_RATE_LIMIT = 10;
const SMTP_RATE_WINDOW = 60 * 1000; // 1 minute

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const createSMTPServer = () => {
  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ['AUTH'],
    size: 1024 * 1024, // 1MB max email size
    onData(stream, session, callback) {
      let emailData = '';

      stream.on('data', (chunk) => {
        emailData += chunk.toString();
      });

      stream.on('end', async () => {
        try {
          const parsed = await simpleParser(emailData);

          // Extract recipient info
          const toAddress = parsed.to?.value?.[0]?.address || '';
          const username = toAddress.split('@')[0];

          if (!username) {
            return callback(new Error('Invalid recipient'));
          }

          // Save email to database
          const email = new Email({
            to: toAddress,
            username: username.toLowerCase(),
            from: parsed.from?.value?.[0]?.address || 'unknown@unknown.com',
            subject: parsed.subject || '(No Subject)',
            text: parsed.text || '',
            html: parsed.html || '',
            attachments: parsed.attachments?.map(att => ({
              filename: att.filename,
              contentType: att.contentType,
              size: att.size
            })) || []
          });

          await email.save();
          console.log(`Email received for: ${username}`);

          // Emit real-time notification
          if (io) {
            io.to(username.toLowerCase()).emit('newEmail', {
              _id: email._id,
              from: email.from,
              subject: email.subject,
              createdAt: email.createdAt
            });
          }

          callback();
        } catch (error) {
          console.error('Error processing email:', error);
          callback(error);
        }
      });
    },
    onConnect(session, callback) {
      const ip = session.remoteAddress;
      const now = Date.now();

      // Clean old entries
      const record = smtpConnections.get(ip) || [];
      const recent = record.filter(ts => now - ts < SMTP_RATE_WINDOW);

      if (recent.length >= SMTP_RATE_LIMIT) {
        console.log(`SMTP rate limit exceeded for: ${ip}`);
        return callback(new Error('Too many connections, try again later'));
      }

      recent.push(now);
      smtpConnections.set(ip, recent);
      console.log(`SMTP connection from: ${ip}`);
      callback();
    }
  });

  return server;
};

module.exports = { createSMTPServer, setSocketIO };
