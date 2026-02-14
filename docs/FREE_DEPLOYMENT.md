# How to Deploy ATS Resume Builder for Free

This guide shows you how to deploy the ATS Resume Builder app for free so anyone can use it.

## Option 1: Vercel + Railway (Recommended - Completely Free)

### Step 1: Deploy Frontend to Vercel (Free)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ats-resume-builder.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Set the following:
     - **Root Directory**: `web`
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     - `VITE_API_URL` = `https://your-backend-url.railway.app` (add after deploying backend)
   - Click "Deploy"

### Step 2: Deploy Backend to Railway (Free Tier)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set **Root Directory**: `server`
5. Add Environment Variables:
   ```
   PORT=3001
   NODE_ENV=production
   SQLITE_PATH=./data/resume.db
   JWT_SECRET=your-secret-key-change-this
   AI_PROVIDER=groq
   GROQ_API_KEY=your-groq-api-key
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
6. Deploy!

### Step 3: Update Frontend with Backend URL

1. Go back to Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` with your Railway backend URL
4. Redeploy

---

## Option 2: Netlify + Render (Also Free)

### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Connect GitHub and select repo
4. Settings:
   - **Base directory**: `web`
   - **Build command**: `npm run build`
   - **Publish directory**: `web/dist`
5. Add environment variable: `VITE_API_URL`

### Backend on Render

1. Go to [render.com](https://render.com)
2. "New" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)

---

## Option 3: Single VPS (DigitalOcean/Linode - $5/month)

For more control, use a cheap VPS:

```bash
# On your VPS
git clone https://github.com/YOUR_USERNAME/ats-resume-builder.git
cd ats-resume-builder

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install

# Build frontend
cd web && npm run build && cd ..

# Setup PM2 for production
npm install -g pm2
cd server
pm2 start npm --name "ats-api" -- run start
pm2 save
pm2 startup

# Setup Nginx
sudo apt install nginx
```

Nginx config (`/etc/nginx/sites-available/ats-resume`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/ats-resume-builder/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
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

## Free AI API Options

### Groq (Recommended - Free Tier)
- Sign up at [console.groq.com](https://console.groq.com)
- Get free API key
- Very fast, uses Llama 3.3 70B
- Set `AI_PROVIDER=groq` and `GROQ_API_KEY=your-key`

### OpenAI (Pay-as-you-go)
- Sign up at [platform.openai.com](https://platform.openai.com)
- $5 free credit for new accounts
- Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=your-key`

### Disable AI Features (Completely Free)
If you don't want to use AI, the app still works for:
- Manual resume building
- Template selection
- PDF/DOCX export
- ATS scoring (rule-based, no AI)

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | `development` or `production` | Yes |
| `SQLITE_PATH` | Database file path | No |
| `JWT_SECRET` | Secret for auth tokens | Yes |
| `AI_PROVIDER` | `groq`, `openai`, or `grok` | No |
| `GROQ_API_KEY` | Groq API key | If using Groq |
| `OPENAI_API_KEY` | OpenAI API key | If using OpenAI |
| `CORS_ORIGIN` | Frontend URL | Yes |
| `VITE_API_URL` | Backend URL (frontend) | Yes |

---

## Custom Domain (Optional)

### On Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown

### On Railway
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

---

## Estimated Costs

| Service | Cost |
|---------|------|
| Vercel (Frontend) | Free |
| Railway (Backend) | Free (500 hours/month) |
| Groq AI | Free tier |
| Custom Domain | $10-15/year |
| **Total** | **$0 - $15/year** |

---

## Quick Deploy Commands

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/ats-resume-builder.git
cd ats-resume-builder

# Install all dependencies
npm install

# Create production .env files
cp server/.env.example server/.env
# Edit server/.env with your values

# Build for production
cd web && npm run build
cd ../server && npm run build

# Start production server
npm start
```

---

## Support

If you need help deploying, check:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

Your app will be live at: `https://your-app-name.vercel.app`
