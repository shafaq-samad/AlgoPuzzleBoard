# 🗄️ Database Setup Guide (PostgreSQL / Neon)

Your application has been updated to use a **PostgreSQL database** (instead of text files) for secure user authentication.

## 1. Get your Connection String

1.  Go to [Neon Console](https://console.neon.tech/).
2.  Create a Project if you haven't already.
3.  On the **Dashboard**, look for the **Connection Details** section.
4.  Copy the connection string. It looks like this:
    ```
    postgres://neondb_owner:AbC123xz@ep-shiny-rain-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
    ```

## 2. Configure for Local Development

1.  Open `appsettings.json` in your project folder.
2.  Replace the `DefaultConnection` value with your actual connection string.
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "postgres://neondb_owner:..."
    }
    ```

## 3. Configure for Deployment (Render/Railway)

**Do NOT commit your actual connection string to GitHub** if your repo is public. Instead, use Environment Variables.

### For Render:
1.  Go to your Service Dashboard.
2.  Click **Environment**.
3.  Add a new variable:
    *   **Key:** `ConnectionStrings__DefaultConnection` (Note the double underscore `__`)
    *   **Value:** `Your_Neon_Connection_String`

### For Railway:
1.  Go to your Project Settings > Variables.
2.  Add a new variable:
    *   **Key:** `ConnectionStrings__DefaultConnection`
    *   **Value:** `Your_Neon_Connection_String`

## 4. Run the Application

When the application starts, it will **automatically create the database tables** (`Users` table) because we added auto-migration code in `Program.cs`.

---

## 🔐 Why this is better
*   **Security:** Passwords are now managed in a database system (encourage adding Hashing in future).
*   **Scalability:** Multiple users can login without file lock issues.
*   **Management:** You can connect to Neon to view/edit users directly.
