# Deploy to Render with Docker

## Quick Deploy Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/universal-converter.git
git push -u origin main
```

### 2. Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `uniconvert-backend`
   - **Region**: Oregon (or nearest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`

5. Add Environment Variables:
   ```
   NODE_ENV = production
   PORT = 10000
   MAX_FILE_SIZE = 104857600
   ```

6. Click **Create Web Service**

7. Copy the backend URL (e.g., `https://uniconvert-backend.onrender.com`)

### 3. Deploy Frontend on Render

1. Click **New +** → **Web Service**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `uniconvert-frontend`
   - **Region**: Oregon (same as backend)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`

4. Add Environment Variables:
   ```
   VITE_API_URL = https://uniconvert-backend.onrender.com/api
   PORT = 10000
   ```

5. Click **Create Web Service**

### 4. Access Your App

Frontend URL: `https://uniconvert-frontend.onrender.com`

---

## Using Blueprint (Automatic)

Alternatively, use the `render.yaml` file:

1. Go to Render Dashboard
2. Click **New +** → **Blueprint**
3. Select your repository
4. Render will auto-detect `render.yaml` and deploy both services

---

## Important Notes

- **Free Tier**: Services spin down after 15 mins of inactivity
- **First Request**: May take 30-60 seconds to wake up
- **File Storage**: Temporary on free tier (use Render Disk for persistence)
- **FFmpeg**: Not included in Alpine image - audio/video conversions need custom image

---

## Troubleshooting

### Check Logs
- Go to your service → **Logs** tab

### Build Fails
- Ensure `package.json` has all dependencies
- Check Dockerfile paths are correct

### CORS Errors
- Verify `VITE_API_URL` environment variable
- Backend should allow frontend origin

### 502 Bad Gateway
- Service is starting up, wait 30 seconds
- Check backend health endpoint: `/api/health`
