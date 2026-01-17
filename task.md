# GhostMail - Disposable Email Service

> Personal project for ~100 users | Cost: ~₹80/year (domain only)

---

## Overview

A temporary/disposable email service like SharkLasers where users can:
- Get instant random email addresses
- Receive emails in real-time
- Emails auto-delete after 1 hour
- No registration required

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      USER BROWSER                        │
│                   (Vanilla JS / React)                   │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP + WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                        │
│                     (Port 3000)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ REST API    │  │ Socket.io    │  │ Cleanup Cron   │  │
│  │ /api/inbox  │  │ Real-time    │  │ Delete old     │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SMTP SERVER                           │
│                     (Port 25)                            │
│         Receives emails → Parses → Saves to DB           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     MONGODB                              │
│              Collection: emails                          │
│  { to, from, subject, body, html, createdAt }           │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express |
| SMTP Server | `smtp-server` package |
| Email Parser | `mailparser` package |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Cron Jobs | node-cron |
| Frontend | Vanilla JS |

---

## Implementation Progress

### Phase 1: Setup
- [ ] Initialize Node.js project
- [ ] Install dependencies
- [ ] Setup folder structure
- [ ] Configure MongoDB connection
- [ ] Setup Express server

### Phase 2: SMTP Server
- [ ] Create SMTP server with `smtp-server`
- [ ] Parse emails with `mailparser`
- [ ] Extract username from recipient
- [ ] Save emails to MongoDB

### Phase 3: REST API
- [ ] GET /api/inbox/:username
- [ ] GET /api/email/:id
- [ ] DELETE /api/email/:id
- [ ] POST /api/generate

### Phase 4: Real-time
- [ ] Setup Socket.io
- [ ] Room-based connections
- [ ] Emit on new email
- [ ] Client-side socket handling

### Phase 5: Cleanup Job
- [ ] Setup node-cron
- [ ] Delete old emails every 5 mins

### Phase 6: Frontend
- [ ] HTML structure
- [ ] CSS styling
- [ ] JavaScript logic
- [ ] Socket.io client
- [ ] Copy to clipboard

### Phase 7: Deployment
- [ ] Buy domain (.xyz ~₹80)
- [ ] Setup Oracle Cloud VPS (FREE)
- [ ] Configure DNS (A + MX records)
- [ ] Install Node.js, MongoDB
- [ ] Setup PM2
- [ ] Setup Nginx + SSL

---

## REST API Endpoints

```
GET  /api/inbox/:username     → Get all emails for user
GET  /api/email/:id           → Get single email
DELETE /api/email/:id         → Delete email
POST /api/generate            → Generate random email
```

---

## Environment Variables (.env)

```env
PORT=3000
SMTP_PORT=25
MONGODB_URI=mongodb://localhost:27017/ghostmail
DOMAIN=ghostmail.xyz
EMAIL_EXPIRY_HOURS=1
```

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Domain (.xyz) | ₹80/year |
| Oracle Cloud VPS | FREE forever |
| MongoDB (local) | FREE |
| SSL (Let's Encrypt) | FREE |
| **Total** | **₹80/year** |

---

**Project: GhostMail**
**Created by: Sayed Abdul Karim**
