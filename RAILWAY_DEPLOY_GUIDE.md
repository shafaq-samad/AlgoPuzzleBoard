# 🚀 Deploying AlgoPuzzleBoard on Railway

Since your code is already on GitHub, deploying to Railway is incredibly fast.

### **Step 1: Sign Up / Login**
1. Go to [railway.app](https://railway.app/).
2. Login with your **GitHub** account.

### **Step 2: Create a New Service**
1. Click **+ New Project** (or "Start a New Project").
2. Select **"Deploy from GitHub repo"**.
3. Choose your repository: `shafaq-samad/AlgoPuzzleBoard`.
4. Click **Deploy Now**.

### **Step 3: Configure Environment Variables**
Your app needs to know how to connect to your Neon Database.

1. Click on your new project card in Railway.
2. Go to the **Variables** tab.
3. Click **New Variable** and add:
   *   **Variable Name:** `ConnectionStrings__DefaultConnection`
   *   **Value:** *(Paste your Neon Database Connection String here - the same one from your local `appsettings.json`)*
   
   *(Note: The double underscore `__` is important! It replaces the `:` in JSON structure for environment variables).*

4. (Optional) Add another variable for environment:
   *   **Variable Name:** `ASPNETCORE_ENVIRONMENT`
   *   **Value:** `Production`

### **Step 4: Generate a Public Domain**
1. Go to the **Settings** tab.
2. Scroll down to **"Public Networking"** (or Domains).
3. Click **"Generate Domain"**.
4. Railway will create a URL like `algopuzzleboard-production.up.railway.app`.

### **Step 5: Verify**
Click that generated link. Your AlgoPuzzleBoard should be live! 🚀

---

### **Troubleshooting**
*   **Build Failed?** Click "View Logs". Since we included a valid `Dockerfile`, it should build automatically.
*   **Database Error?** Ensure you pasted the `ConnectionStrings__DefaultConnection` exactly correct. It usually looks like `postgres://neondb_owner:.....@ep-cool-....neon.tech/neondb?sslmode=require`.
