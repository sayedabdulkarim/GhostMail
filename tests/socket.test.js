const { io: ioClient } = require('socket.io-client');
const Email = require('../server/models/Email');
const { createTestApp, connectTestDB, cleanup } = require('./setup');

const TEST_PORT = 3099;
let server, io;

beforeAll(async () => {
  await connectTestDB();
  ({ server, io } = createTestApp());
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
});

afterAll(async () => {
  await Email.deleteMany({ username: /^sockettest/ });
  await cleanup();
});

const createClient = () => {
  return ioClient(`http://localhost:${TEST_PORT}`, {
    transports: ['websocket'],
    forceNew: true
  });
};

describe('Socket.io', () => {
  it('should connect successfully', (done) => {
    const client = createClient();
    client.on('connect', () => {
      expect(client.connected).toBe(true);
      client.disconnect();
      done();
    });
  });

  it('should join a room and receive newEmail event', (done) => {
    const client = createClient();
    const username = 'sockettest01';

    client.on('connect', () => {
      client.emit('join', username);

      // Simulate server emitting to the room after a short delay
      setTimeout(() => {
        io.to(username).emit('newEmail', {
          _id: 'fake123',
          from: 'test@test.com',
          subject: 'Socket Test',
          createdAt: new Date()
        });
      }, 200);
    });

    client.on('newEmail', (data) => {
      expect(data.subject).toBe('Socket Test');
      expect(data.from).toBe('test@test.com');
      client.disconnect();
      done();
    });
  });

  it('should not receive events after leaving room', (done) => {
    const client = createClient();
    const username = 'sockettest02';
    let received = false;

    client.on('connect', () => {
      client.emit('join', username);

      setTimeout(() => {
        client.emit('leave', username);

        setTimeout(() => {
          io.to(username).emit('newEmail', { subject: 'Should Not Get' });
        }, 200);
      }, 200);
    });

    client.on('newEmail', () => {
      received = true;
    });

    // Wait and verify no event was received
    setTimeout(() => {
      expect(received).toBe(false);
      client.disconnect();
      done();
    }, 1000);
  });
});
