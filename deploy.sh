#!/bin/bash
# GhostMail Deploy Script
# Usage: ./deploy.sh

SERVER="ubuntu@161.118.161.75"
KEY="~/.ssh/ghostmail_key"
APP_DIR="/home/ubuntu/ghostmail"

echo "🚀 Deploying GhostMail..."

# Step 1: Push to GitHub
echo "📤 Pushing to GitHub..."
git add -A
git commit -m "update: deploy changes" 2>/dev/null
git push origin master

# Step 2: Pull on server & restart
echo "📥 Pulling on server..."
ssh -i $KEY $SERVER "cd $APP_DIR && git pull origin master && npm install && sudo pm2 restart ghostmail"

echo "✅ Deployed! Check: https://myghostmail.shop"
