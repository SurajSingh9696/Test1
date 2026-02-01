# Universal Converter Web Application

A production-ready file conversion platform supporting documents, images, audio, video, and archives.

## Features

- **Document Conversion**: PDF, DOCX, XLSX, PPTX, HTML, CSV, JSON
- **Image Conversion**: JPG, PNG, WEBP, GIF, SVG with resize, compress, crop
- **Audio Conversion**: MP3, WAV, AAC, OGG, FLAC with bitrate control
- **Video Conversion**: MP4, MKV, AVI, WEBM, MOV with resolution changes
- **Archive Operations**: ZIP, TAR creation and extraction
- **Batch Processing**: Convert multiple files at once
- **Dark/Light Mode**: Toggle between themes
- **Toast Notifications**: Real-time feedback for all operations
- **Robust Error Handling**: Graceful failure handling for all conversion types

---

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker Desktop installed
- Docker Compose (included with Docker Desktop)

### Quick Start with Docker

```bash
# Clone and navigate to project
cd "Test project"

# Build and start containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Access the application at: `http://localhost`**

### Docker Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Docker Network                    │
│  ┌─────────────────┐      ┌─────────────────────┐  │
│  │    Frontend     │      │      Backend        │  │
│  │   (Nginx:80)    │─────>│   (Node.js:5000)    │  │
│  │   React Build   │ /api │   Express Server    │  │
│  └─────────────────┘      └─────────────────────┘  │
│           │                        │               │
│           │                ┌───────┴───────┐       │
│           │                │   Volumes     │       │
│           │                │  - uploads    │       │
│           │                │  - converted  │       │
│           │                └───────────────┘       │
└───────────┼────────────────────────────────────────┘
            │
       Port 80:80
            │
      ┌─────┴─────┐
      │  Browser  │
      │ localhost │
      └───────────┘
```

---

## 🌐 Hosting on Cloud Platforms

### Option 1: DigitalOcean Droplet

```bash
# 1. Create a Droplet (Ubuntu 22.04, 2GB+ RAM)

# 2. SSH into server
ssh root@your-droplet-ip

# 3. Install Docker
curl -fsSL https://get.docker.com | sh

# 4. Clone your project
git clone https://github.com/yourusername/universal-converter.git
cd universal-converter

# 5. Create .env file (optional)
echo "NODE_ENV=production" > .env

# 6. Deploy
docker-compose up --build -d

# 7. (Optional) Set up SSL with Certbot
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

### Option 2: AWS EC2

```bash
# 1. Launch EC2 instance (t2.medium or higher)
# 2. Configure Security Group: Allow ports 80, 443, 22

# 3. Connect and install Docker
sudo yum update -y  # Amazon Linux
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# 4. Install Docker Compose
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Clone and deploy
git clone https://github.com/yourusername/universal-converter.git
cd universal-converter
docker-compose up --build -d
```

### Option 3: Railway / Render

1. Connect your GitHub repository
2. Railway/Render will auto-detect Dockerfile
3. Set environment variables in dashboard
4. Deploy with one click

### Option 4: VPS with Docker (Any Provider)

```bash
# On any VPS (Vultr, Linode, Hetzner, etc.)

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone project
git clone <your-repo-url>
cd universal-converter

# Build and run
docker-compose up --build -d

# Check status
docker-compose ps
```

---

## 🔧 Production Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Backend
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=104857600
CLEANUP_INTERVAL=3600000

# Optional: Custom domains
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

### SSL/HTTPS Setup

Add to `docker-compose.yml` for production:

```yaml
services:
  nginx-proxy:
    image: jwilder/nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - certs:/etc/nginx/certs
    
  letsencrypt:
    image: jrcs/letsencrypt-nginx-proxy-companion
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - certs:/etc/nginx/certs
    environment:
      - NGINX_PROXY_CONTAINER=nginx-proxy
```

### Scaling with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml uniconvert

# Scale backend
docker service scale uniconvert_backend=3
```

---

## 💻 Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- npm or yarn
- FFmpeg (for audio/video)

### Installing FFmpeg

**Windows:** `winget install FFmpeg.FFmpeg`  
**macOS:** `brew install ffmpeg`  
**Linux:** `sudo apt install ffmpeg`

### Start Development

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

**Backend:** `http://localhost:5000`  
**Frontend:** `http://localhost:5173`

---

## 📁 Project Structure

```
├── backend/
│   ├── Dockerfile
│   ├── config/         # Configuration
│   ├── middleware/     # Error handling, upload
│   ├── routes/         # API routes
│   ├── services/       # Conversion logic
│   └── server.js
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf      # Nginx config
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Toast, helpers
│   │   └── App.jsx
│   └── index.html
│
├── docker-compose.yml
└── README.md
```

---

## 🎨 Design

- **Primary**: Emerald Green (#10B981)
- **Accent**: Amber (#F59E0B)
- **Dark Mode**: Charcoal (#1A1A2E)

---

## 📜 License

MIT
# Test1
# Test1
