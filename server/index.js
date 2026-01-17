require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const inboxRoutes = require('./routes/inbox');
const setupSocket = require('./socket/socketHandler');
const { createSMTPServer, setSocketIO } = require('./smtp/smtpServer');
const startCleanupJob = require('./jobs/cleanup');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api', inboxRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Initialize
const PORT = process.env.PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 2525;

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Setup Socket.io
  setupSocket(io);
  setSocketIO(io);

  // Start SMTP server
  const smtpServer = createSMTPServer();
  smtpServer.listen(SMTP_PORT, () => {
    console.log(`SMTP Server running on port ${SMTP_PORT}`);
  });

  // Start cleanup job
  startCleanupJob();

  // Start HTTP server
  server.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
    console.log(`Domain: ${process.env.DOMAIN}`);
  });
};

start().catch(console.error);
