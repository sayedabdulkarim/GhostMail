# GhostMail

Temporary emails that vanish. A disposable email service for privacy-conscious users.

![GhostMail](https://img.shields.io/badge/GhostMail-Disposable%20Email-a78bfa?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io)
![Tests](https://img.shields.io/badge/Tests-21%2F21%20passing-brightgreen?style=flat-square)

## Live

**https://myghostmail.shop**

## Features

- **Custom email addresses** - Choose your own username (e.g., `sayed@myghostmail.shop`)
- **Random email generation** - One-click random email address
- **Real-time delivery** - Emails appear instantly via WebSocket (no refresh)
- **Auto-delete** - Emails vanish after 1 hour
- **No registration** - Start using immediately
- **Dark theme UI** - Clean, modern dark interface
- **Rate limiting** - API & SMTP rate limiting to prevent abuse
- **Security headers** - Helmet.js for HTTP security
- **Server-side validation** - Input sanitization on all endpoints

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express 5 |
| SMTP Server | smtp-server |
| Email Parser | mailparser |
| Database | MongoDB Atlas (Mongoose) |
| Real-time | Socket.io |
| Cron Jobs | node-cron |
| Frontend | Vanilla JS (no frameworks) |
| Security | helmet, express-rate-limit |
| Testing | Jest, Supertest |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |
| SSL | Let's Encrypt (certbot) |

## Architecture

```
User Browser (Vanilla JS + Socket.io)
        |
        | HTTP + WebSocket
        v
   Nginx (SSL termination)
        |
        v
   Express Server (port 3000)
   ├── REST API (/api/*)
   ├── Socket.io (real-time)
   └── Cron Job (cleanup every 5 min)
        |
        v
   SMTP Server (port 25)
   ├── Receives incoming emails
   ├── Parses with mailparser
   └── Saves to MongoDB
        |
        v
   MongoDB Atlas
   └── TTL index (auto-delete after 1 hour)
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/sayedabdulkarim/ghostmail.git
cd ghostmail

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and domain

# Start development server
npm run dev
```

Open http://localhost:3000

### Run Tests

```bash
npm test
```

```
Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
```

### Test Email (Local)

```bash
node test-email.js yourname@yourdomain.local
```

## Environment Variables

```env
PORT=3000
SMTP_PORT=2525          # Use 25 in production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ghostmail
DOMAIN=yourdomain.com   # Your domain name
EMAIL_EXPIRY_HOURS=1
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/domain` | Get configured domain |
| POST | `/api/generate` | Generate random email |
| GET | `/api/inbox/:username` | Get all emails for user |
| GET | `/api/email/:id` | Get single email |
| DELETE | `/api/email/:id` | Delete email |
| DELETE | `/api/inbox/:username` | Clear inbox |

## Project Structure

```
GhostMail/
├── server/
│   ├── index.js                # Entry point (Express + Helmet + Rate Limit)
│   ├── config/db.js            # MongoDB connection
│   ├── models/Email.js         # Email schema (TTL index)
│   ├── smtp/smtpServer.js      # SMTP server (rate limit + size limit)
│   ├── routes/inbox.js         # REST API (server-side validation)
│   ├── socket/socketHandler.js # Socket.io room management
│   └── jobs/cleanup.js         # Cron job (every 5 min)
├── client/
│   ├── index.html              # UI structure
│   ├── css/style.css           # Dark theme styling
│   └── js/app.js               # Client logic + Socket.io
├── tests/
│   ├── setup.js                # Test helper
│   ├── api.test.js             # API tests (13 tests)
│   ├── smtp.test.js            # SMTP tests (2 tests)
│   ├── socket.test.js          # Socket.io tests (3 tests)
│   └── cleanup.test.js         # Cleanup tests (2 tests)
├── .env.example
├── package.json
├── todolist.md
└── README.md
```

## Deployment

### Requirements
- VPS with port 25 open (Oracle Cloud Free Tier recommended)
- Domain name (~$1/year for .shop/.xyz)

### DNS Configuration

```
Type     Host    Value                    Priority
─────────────────────────────────────────────────────
A        @       YOUR_SERVER_IP           -
A        mail    YOUR_SERVER_IP           -
MX       @       mail.yourdomain.com      10
TXT      @       v=spf1 mx ~all           -
```

### Server Setup

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Clone & setup
git clone https://github.com/sayedabdulkarim/ghostmail.git
cd ghostmail
npm install
cp .env.example .env
# Edit .env — set SMTP_PORT=25 and your MongoDB URI

# Start with PM2
sudo npm install -g pm2
sudo pm2 start server/index.js --name ghostmail --cwd /path/to/ghostmail
sudo pm2 save
sudo pm2 startup

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/ghostmail
# Add proxy_pass to localhost:3000 (see nginx config below)
sudo ln -s /etc/nginx/sites-available/ghostmail /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Firewall (Oracle Cloud / iptables)

```bash
# Open ports on server
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 25 -j ACCEPT
sudo netfilter-persistent save

# Also open ports 80, 443, 25 in Oracle Cloud Security List (Ingress Rules)
```

## Cost

| Item | Cost |
|------|------|
| Domain (.shop) | ~$1/year |
| Oracle Cloud VPS | FREE forever |
| MongoDB Atlas | FREE (512MB) |
| SSL (Let's Encrypt) | FREE |
| **Total** | **~$1/year** |

## License

MIT

---

Made with ❤️ by [Sayed Abdul Karim](https://github.com/sayedabdulkarim)
