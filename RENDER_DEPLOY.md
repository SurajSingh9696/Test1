# Deploy to Render with Docker

## Option 1: Manual Deploy (Recommended)

### Step 1: Deploy Backend First

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `uniconvert-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Docker` |
   | **Dockerfile Path** | `./Dockerfile` |

4. Add Environment Variables:
   ```
   NODE_ENV = production
   PORT = 10000
   MAX_FILE_SIZE = 104857600
   ```

5. Click **Create Web Service**
6. **Wait for deploy to complete** and copy the URL (e.g., `https://uniconvert-backend.onrender.com`)

### Step 2: Deploy Frontend

1. **New +** → **Web Service**
2. Connect the **same** repository
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `uniconvert-frontend` |
   | **Root Directory** | `frontend` |
   | **Runtime** | `Docker` |
   | **Dockerfile Path** | `./Dockerfile` |

4. Add Environment Variables:
   ```
   VITE_API_URL = https://uniconvert-backend.onrender.com/api
   PORT = 10000
   ```
   *(Replace with your actual backend URL)*

5. Click **Create Web Service**

### Step 3: Access Your App

Frontend: `https://uniconvert-frontend.onrender.com`

---

## Option 2: Blueprint Deploy

1. Push code to GitHub
2. Go to Render → **New +** → **Blueprint**
3. Select your repo
4. Render auto-deploys using `render.yaml`

---

## Important: Render Port

Render expects services to listen on port **10000** (not 80 or 5000).

The Dockerfiles are configured to accept PORT as a build argument.

---

## Troubleshooting

### "is a directory" Error
This error occurs when Render misinterprets the Dockerfile path. **Verify these EXACT settings in Render Dashboard:**

| Setting | Correct Value | Common Mistake |
|---------|---------------|----------------|
| **Root Directory** | `frontend` | Leaving blank |
| **Dockerfile Path** | `./Dockerfile` | Setting to `frontend` |

**Important:** The Dockerfile Path is **relative to the Root Directory**, not the repo root.

If using "Dockerfile" as the path (without `./`), try `./Dockerfile` instead.

### Build Fails
- Check Render logs for npm errors
- Ensure package.json is valid

### 502 Error
- Wait 30-60 seconds for cold start
- Check `/api/health` endpoint

### CORS Errors
- Verify VITE_API_URL includes `/api` suffix
- Backend should allow frontend origin
