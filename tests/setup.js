require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const inboxRoutes = require('../server/routes/inbox');
const setupSocket = require('../server/socket/socketHandler');
const { createSMTPServer, setSocketIO } = require('../server/smtp/smtpServer');

let server, io, smtpServer;

const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', inboxRoutes);

  server = http.createServer(app);
  io = new Server(server, { cors: { origin: '*' } });
  setupSocket(io);
  setSocketIO(io);

  return { app, server, io };
};

const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const startTestSMTP = (port = 2526) => {
  smtpServer = createSMTPServer();
  return new Promise((resolve) => {
    smtpServer.listen(port, () => resolve(smtpServer));
  });
};

const cleanup = async () => {
  if (smtpServer) smtpServer.close();
  if (server) server.close();
  if (io) io.close();
  await mongoose.connection.close();
};

module.exports = { createTestApp, connectTestDB, startTestSMTP, cleanup };
