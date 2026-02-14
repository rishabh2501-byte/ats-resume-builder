# Deployment Guide

## Table of Contents
1. [Web Application Deployment](#web-application-deployment)
2. [Backend API Deployment](#backend-api-deployment)
3. [Desktop App Build](#desktop-app-build)
4. [Chrome Extension Publishing](#chrome-extension-publishing)

---

## Web Application Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Build the web app**
   ```bash
   cd web
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Environment Variables**
   Set in Vercel dashboard:
   - `VITE_API_URL` = Your backend API URL

### Option 2: Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `dist`
3. **Environment variables**: Set `VITE_API_URL`

### Option 3: Self-hosted (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/ats-resume/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Backend API Deployment

### Option 1: Railway

1. **Connect GitHub repository**
2. **Set root directory**: `server`
3. **Environment variables**:
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   GROK_API_KEY=your-grok-api-key
   OPENAI_API_KEY=your-openai-key (optional)
   ```

### Option 2: Render

1. **Create new Web Service**
2. **Build command**: `cd server && npm install && npm run build`
3. **Start command**: `cd server && npm start`
4. **Set environment variables**

### Option 3: Docker

**Dockerfile** (create in server folder):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY data ./data

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

**Build and run**:
```bash
cd server
npm run build
docker build -t ats-resume-api .
docker run -p 3001:3001 --env-file .env ats-resume-api
```

### Option 4: PM2 (VPS)

```bash
# Install PM2
npm install -g pm2

# Build
cd server
npm run build

# Start with PM2
pm2 start dist/index.js --name "ats-resume-api"

# Save PM2 config
pm2 save
pm2 startup
```

---

## Desktop App Build

### Prerequisites
- Node.js 18+
- For Windows builds on Mac/Linux: Wine
- For Mac builds: Xcode Command Line Tools

### Build Commands

```bash
cd desktop
npm install

# Build for current platform
npm run build

# Build for specific platforms
npm run build:mac    # macOS (.dmg, .zip)
npm run build:win    # Windows (.exe, portable)
npm run build:linux  # Linux (.AppImage, .deb)
```

### Output
Built files will be in `desktop/dist/`:
- **macOS**: `ATS Resume Builder-1.0.0.dmg`
- **Windows**: `ATS Resume Builder Setup 1.0.0.exe`
- **Linux**: `ATS Resume Builder-1.0.0.AppImage`

### Code Signing (Production)

**macOS**:
1. Obtain Apple Developer certificate
2. Add to `package.json` build config:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name (TEAM_ID)"
   }
   ```

**Windows**:
1. Obtain code signing certificate
2. Add to build config:
   ```json
   "win": {
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "password"
   }
   ```

---

## Chrome Extension Publishing

### 1. Prepare for Publishing

1. **Create icons** (PNG format):
   - `icons/icon16.png` (16x16)
   - `icons/icon48.png` (48x48)
   - `icons/icon128.png` (128x128)

2. **Update manifest.json** for production:
   - Change API URL from localhost to production URL
   - Update version number

3. **Create ZIP file**:
   ```bash
   cd extension
   zip -r ats-resume-extension.zip . -x "*.git*"
   ```

### 2. Chrome Web Store Submission

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee
3. Click "New Item"
4. Upload ZIP file
5. Fill in listing details:
   - **Title**: ATS Resume Optimizer
   - **Description**: Extract job descriptions and analyze resume match
   - **Category**: Productivity
   - **Screenshots**: At least 1 screenshot (1280x800 or 640x400)

### 3. Review Process
- Initial review: 1-3 business days
- Updates: Usually faster

---

## Environment Variables Reference

### Server (.env)
```env
# Required
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secure-secret-key

# AI (at least one required for AI features)
GROK_API_KEY=xai-your-grok-key
OPENAI_API_KEY=sk-your-openai-key
AI_PROVIDER=grok  # or openai

# Optional
MONGODB_URI=mongodb://...
SQLITE_PATH=./data/resume.db
CORS_ORIGIN=https://yourdomain.com
```

### Web (.env)
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## Health Checks

### API Health Check
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Web App
```bash
curl -I https://yourdomain.com
# Expected: HTTP/2 200
```

---

## Monitoring (Optional)

### Recommended Tools
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Analytics**: Plausible, Simple Analytics
- **Logs**: LogDNA, Papertrail

---

## Troubleshooting

### Common Issues

1. **CORS errors**
   - Ensure `CORS_ORIGIN` matches your frontend URL
   - Include protocol (https://)

2. **Database errors**
   - Check SQLite file permissions
   - Ensure data directory exists

3. **AI features not working**
   - Verify API keys are set
   - Check API key has sufficient credits

4. **Extension not connecting**
   - Update API URL in popup.js
   - Check CORS settings allow extension origin
