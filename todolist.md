# GhostMail - Todo List

---

## Phase 1: Setup ✅
- [x] Initialize Node.js project
- [x] Install dependencies
- [x] Setup folder structure
- [x] Configure MongoDB connection
- [x] Setup Express server

## Phase 2: SMTP Server ✅
- [x] Create SMTP server with `smtp-server`
- [x] Parse emails with `mailparser`
- [x] Extract username from recipient
- [x] Save emails to MongoDB

## Phase 3: REST API ✅
- [x] GET /api/inbox/:username
- [x] GET /api/email/:id
- [x] DELETE /api/email/:id
- [x] DELETE /api/inbox/:username (bonus - clear all)
- [x] POST /api/generate
- [x] GET /api/domain

## Phase 4: Real-time ✅
- [x] Setup Socket.io
- [x] Room-based connections
- [x] Emit on new email
- [x] Client-side socket handling

## Phase 5: Cleanup Job ✅
- [x] Setup node-cron (runs every 5 mins)
- [x] Delete old emails
- [x] MongoDB TTL index (auto-expire after 1 hour)

## Phase 6: Frontend ✅
- [x] HTML structure
- [x] CSS styling (dark theme)
- [x] JavaScript logic
- [x] Socket.io client
- [x] Copy to clipboard
- [x] Countdown timer
- [x] LocalStorage persistence
- [x] Toast notifications
- [x] Responsive design

---

## Phase 7: Security & Hardening ✅
- [x] Remove `.env` from git history — was never committed, already safe
- [x] Add rate limiting on API (`express-rate-limit`) — 100 req/15min per IP
- [x] Add rate limiting on SMTP — 10 connections/min per IP
- [x] Add input validation/sanitization on server-side (username) — regex validation
- [x] Add SMTP size limit (reject oversized emails) — 1MB max
- [x] Add helmet.js for HTTP security headers

## Phase 8: Testing ✅ (21/21 passed)
- [x] Write API tests — 13 tests (domain, generate, inbox, email CRUD, validation)
- [x] Write SMTP receive test — 2 tests (receive + save, lowercase username)
- [x] Write Socket.io connection test — 3 tests (connect, join room, leave room)
- [x] Test email expiry/cleanup flow — 2 tests (delete old emails, TTL index check)

## Phase 9: Deployment ✅
- [x] Buy domain — myghostmail.shop (GoDaddy)
- [x] Setup VPS — Oracle Cloud Always Free (Ubuntu 22.04, 161.118.161.75)
- [x] Configure DNS — A record (@, mail → 161.118.161.75)
- [x] Configure DNS — MX record (mail.myghostmail.shop, priority 10)
- [x] Install Node.js 20 + Nginx on VPS
- [x] Clone repo & setup `.env` on server (SMTP port 25)
- [x] Open ports 25, 80, 443 on iptables + Oracle Security List
- [x] Setup PM2 (auto-restart on boot)
- [x] Setup Nginx reverse proxy (localhost:3000)
- [x] Setup SSL with Let's Encrypt (auto-renew, expires May 2026)
- [x] Test end-to-end: send email → received in browser ✅ VERIFIED

---

## Nice-to-Have (Future) 💡
- [ ] Attachment download support
- [ ] Custom email aliases (pick your own username)
- [ ] QR code for email address
- [ ] Email forwarding to real email
- [ ] Multiple inbox tabs
- [ ] PWA support (installable on phone)
