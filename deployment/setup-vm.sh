#!/bin/bash
echo "======== Starting CodeMonster VM setup ========"

# 1. Update and install base packages
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y git nginx curl wget

# 2. Creating swap file to prevent crashing
echo "Creating 2GB swap file..."
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# Make the swap file permanent
sudo cp /etc/fstab /etc/fstab.bak
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
echo "Swap file created and activated."

# 3. Install Node.js via NVM
echo "Installing NVM and Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
echo "Node.js and NVM installed."

# 4. Install PM2
echo "Installing PM2..."
npm install -g pm2

# 5. Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql.service

echo "PostgreSQL installed."
echo "--- IMPORTANT ---"
echo "We need to create your database user. You will be prompted for a password."
echo "PLEASE REMEMBER THIS PASSWORD. You will need it for your .env file."

# Creates a user 'codemonster_user' and this prompts to set its password
sudo -u postgres createuser -P --interactive codemonster_user
# Creates the database 'codemonster' owned by your new user
sudo -u postgres createdb codemonster -O codemonster_user
echo "PostgreSQL user and database created."

# 6. Install Redis
echo "Installing Redis..."
sudo apt-get install -y redis-server
sudo systemctl enable redis-server.service
echo "Redis installed."

# 7. Install Docker
echo "Installing Docker..."
sudo apt-get install -y docker.io
sudo usermod -aG docker ubuntu
echo "Docker installed."

# 8. Install Certbot
echo "Installing Certbot and Nginx plugin..."
sudo apt-get install -y certbot python3-certbot-nginx
echo "Certbot installed. It will be run at the end of the deployment."

# 9. Final Check
echo "----------------------------------------------------------------"
echo "VM SETUP COMPLETE!"
echo "Node: $(node -v), NPM: $(npm -v)"
echo ""
echo "CRITICAL STEP: You MUST log out and log back in to apply"
echo "Docker permissions before running the deploy script."
echo "----------------------------------------------------------------"