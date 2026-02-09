# ⚡️ IMMEDIATE PHONE TESTING GUIDE (No Cloud Config Required)

Since you don't have `gcloud` or `docker` installed, the fastest way to test on your phone is to "tunnel" your local server to the internet.

## Option 1: The "Hackathon Speed" Method (Localtunnel)

We will use `localtunnel` to create public links for your running backend and frontend.

### Step 1: Start the Backend Channel
1. Open a new terminal.
2. Run your backend normally: `./start_app.sh` (or just the backend part).
3. In *another* terminal, expose port 8000:
   ```bash
   npx localtunnel --port 8000
   ```
4. **COPY the URL** it gives you (e.g., `https://floppy-dog-42.loca.lt`). This is your **Backend URL**.

### Step 2: Configure Frontend
1. Open `frontend/.env.local`.
2. Update the variable to point to your new Backend URL:
   ```env
   # IMPORTANT: Change 'https' to 'wss' for the websocket URL
   NEXT_PUBLIC_WS_URL=wss://floppy-dog-42.loca.lt/ws 
   NEXT_PUBLIC_API_URL=https://floppy-dog-42.loca.lt
   ```

### Step 3: Start the Frontend Channel
1. Ensure frontend is running on 3000.
2. In a terminal, expose port 3000:
   ```bash
   npx localtunnel --port 3000
   ```
3. **COPY this URL** (e.g., `https://spicy-cat-99.loca.lt`).

### Step 4: Test on Phone
1. Open the **Frontend URL** on your mobile phone.
2. Grant Camera Permissions.
3. Start Coaching!

---

## Option 2: Production Deployment (Requires Setup)

### Frontend (Vercel)
You can deploy the frontend easily using `npx vercel`.
1. Run `cd frontend && npx vercel`.
2. Follow the prompts.

### Backend (Cloud Run)
This requires `gcloud` CLI.
1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Run `gcloud auth login`.
3. Run `gcloud run deploy` inside the `backend` folder.
