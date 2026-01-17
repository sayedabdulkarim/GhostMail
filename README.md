# GhostMail

Temporary emails that vanish. A disposable email service for privacy-conscious users.

![GhostMail](https://img.shields.io/badge/GhostMail-Disposable%20Email-a78bfa?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io)

## Features

- **Custom email addresses** - Choose your own username (e.g., `hello@myghostmail.shop`)
- **Random email generation** - One-click random email
- **Real-time delivery** - Emails appear instantly via WebSocket
- **Auto-delete** - Emails vanish after 1 hour
- **No registration** - Start using immediately
- **Dark theme UI** - Easy on the eyes

## Demo

> Live: [myghostmail.shop](https://myghostmail.shop) *(coming soon)*

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express |
| SMTP Server | smtp-server |
| Email Parser | mailparser |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Cron Jobs | node-cron |
| Frontend | Vanilla JS |

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

### Test Email (Local)

```bash
node test-email.js yourname@yourdomain.local
```

## Environment Variables

```env
PORT=3000
SMTP_PORT=2525
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ghostmail
DOMAIN=myghostmail.shop
EMAIL_EXPIRY_HOURS=1
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/domain | Get configured domain |
| POST | /api/generate | Generate random email |
| GET | /api/inbox/:username | Get all emails for user |
| GET | /api/email/:id | Get single email |
| DELETE | /api/email/:id | Delete email |
| DELETE | /api/inbox/:username | Clear inbox |

## Project Structure

```
GhostMail/
├── server/
│   ├── index.js              # Entry point
│   ├── config/db.js          # MongoDB connection
│   ├── models/Email.js       # Email schema
│   ├── smtp/smtpServer.js    # SMTP server
│   ├── routes/inbox.js       # REST API
│   ├── socket/socketHandler.js
│   └── jobs/cleanup.js       # Cron job
├── client/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── .env.example
├── package.json
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
MX       @       mail.myghostmail.shop    10
TXT      @       v=spf1 mx ~all           -
```

### Server Setup

```bash
# On VPS
git clone https://github.com/sayedabdulkarim/ghostmail.git
cd ghostmail
npm install

# Setup PM2
npm install -g pm2
pm2 start server/index.js --name ghostmail
pm2 save
pm2 startup

# Setup Nginx + SSL
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d myghostmail.shop
```

## Cost

| Item | Cost |
|------|------|
| Domain (.shop) | ~$1/year |
| Oracle Cloud VPS | FREE |
| MongoDB Atlas | FREE |
| SSL (Let's Encrypt) | FREE |
| **Total** | **~$1/year** |

## License

MIT

---

Made with ❤️ by [Sayed Abdul Karim](https://github.com/sayedabdulkarim)
