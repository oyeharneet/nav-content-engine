# Nav's Content Engine

Turn any YouTube video into Instagram carousel, LinkedIn post & WhatsApp blast — in Nav's voice.

Built by Harneet Singh · AI Automation

---

## Deploy to Vercel in 10 minutes

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy it — you'll need it in Step 4

### Step 2 — Upload this folder to GitHub
1. Go to https://github.com and sign in (create free account if needed)
2. Click **New repository** → name it `nav-content-engine` → **Create**
3. Click **uploading an existing file**
4. Drag this entire folder in → **Commit changes**

### Step 3 — Deploy to Vercel
1. Go to https://vercel.com → Sign in with GitHub
2. Click **Add New Project**
3. Select your `nav-content-engine` repo → **Import**
4. Leave all settings as default → **Deploy**

### Step 4 — Add your API key
1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your key from Step 1
3. Click **Save**
4. Go to **Deployments** → click the three dots on your latest deployment → **Redeploy**

### Step 5 — Done
Your app is live at `https://nav-content-engine.vercel.app` (or similar)

Share that link with Nav.

---

## How it works

1. Paste a YouTube URL → app extracts the transcript automatically
2. Or paste transcript / talking points manually
3. Hit Generate → Claude writes carousel, LinkedIn post & WhatsApp blast in Nav's voice
4. Copy and post

---

## Local development (optional)

```bash
npm install
# Create .env.local file with:
# ANTHROPIC_API_KEY=your_key_here
npm run dev
# Open http://localhost:3000
```
