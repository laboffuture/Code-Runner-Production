#!/bin/bash
# VPS Prerequisites Setup - Install Required Software Only
# Run this FIRST to prepare your Ubuntu VPS
# Then deploy code separately

set -e  # Exit on any error

echo "🔧 Installing VPS Prerequisites..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root: sudo bash vps-setup-prerequisites.sh${NC}"
  exit 1
fi

echo -e "${YELLOW}📦 Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}🐳 Step 2: Installing Docker...${NC}"
# Remove old Docker versions if any
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Test Docker
docker --version
echo -e "${GREEN}✅ Docker installed successfully${NC}"

echo -e "${YELLOW}📦 Step 3: Installing Node.js 18...${NC}"
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
echo -e "${GREEN}✅ Node.js installed successfully${NC}"

echo -e "${YELLOW}🔴 Step 4: Installing Redis...${NC}"
apt-get install -y redis-server

# Configure Redis
cat >> /etc/redis/redis.conf << 'EOF'

# Performance tuning
maxmemory 256mb
maxmemory-policy allkeys-lru

# Bind to localhost only (secure)
bind 127.0.0.1

# Enable persistence
appendonly yes
EOF

# Set Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)
echo "requirepass $REDIS_PASSWORD" >> /etc/redis/redis.conf

# Start Redis
systemctl restart redis-server
systemctl enable redis-server

# Test Redis
redis-cli -a "$REDIS_PASSWORD" ping >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Redis installed successfully${NC}"
else
  echo -e "${RED}❌ Redis installation failed${NC}"
  exit 1
fi

echo -e "${YELLOW}🌐 Step 5: Installing Nginx...${NC}"
apt-get install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}✅ Nginx installed successfully${NC}"

echo -e "${YELLOW}🔧 Step 6: Installing PM2 globally...${NC}"
npm install -g pm2

# Verify PM2
pm2 --version
echo -e "${GREEN}✅ PM2 installed successfully${NC}"

echo -e "${YELLOW}🛡️  Step 7: Configuring firewall (UFW)...${NC}"
# Install UFW if not installed
apt-get install -y ufw

# Allow SSH (important!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall (will ask for confirmation)
echo "y" | ufw enable

ufw status
echo -e "${GREEN}✅ Firewall configured${NC}"

echo -e "${YELLOW}📦 Step 8: Installing build tools...${NC}"
apt-get install -y build-essential curl wget git

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ VPS Prerequisites Installation Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Summary of installed software:"
echo "  • Docker:    $(docker --version | cut -d' ' -f3)"
echo "  • Node.js:   $(node --version)"
echo "  • npm:       $(npm --version)"
echo "  • Redis:     $(redis-server --version | cut -d' ' -f3)"
echo "  • Nginx:     $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "  • PM2:       $(pm2 --version)"
echo ""
echo "🔐 IMPORTANT - Save these credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}Redis Password: $REDIS_PASSWORD${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Save this password! You'll need it for .env configuration"
echo ""
echo "✅ Next steps:"
echo "  1. Save the Redis password above"
echo "  2. Clone your repository to /var/www/code-runner"
echo "  3. Configure .env files with Redis password"
echo "  4. Build and deploy your application"
echo ""
