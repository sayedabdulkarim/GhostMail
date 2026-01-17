const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const Email = require('../models/Email');

let io = null;

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const createSMTPServer = () => {
  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ['AUTH'],
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
      console.log(`SMTP connection from: ${session.remoteAddress}`);
      callback();
    }
  });

  return server;
};

module.exports = { createSMTPServer, setSocketIO };
