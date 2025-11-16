#!/bin/bash
echo "Starting new deployment for CodeMonster..."

git pull origin main

# 1. Install/Update dependencies for Frontend
echo "Building Frontend..."
cd ../frontend
npm install
npm run build

# 2. Install/Update dependencies for Server
echo "Building Server..."
cd ../server
npm install
npm run db:generate
npm run db:push
npm run build

# 3. Install/Update dependencies for Judge
echo "Building Judge and Docker images..."
cd ../judge
npm install
npm run build
npm run docker:build

# 4. Restart all apps with PM2
echo "Restarting applications..."
cd ../deployment
pm2 reload ecosystem.config.js 

echo "------------------------"
echo "Deployment Finished!"
echo "------------------------"