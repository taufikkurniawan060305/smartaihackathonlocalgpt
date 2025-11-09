# Mini Jarvis Backend

Backend service that powers the Mini Jarvis automation system, including Google Calendar integration, email automation, and Twitter/X assistant.

## 🚀 How to Start

### Installation
```bash
npm install
```

### Run Application
```bash
node ./src/app.js
```

## ⚙️ Environment Variables
Create a `.env` file inside the root directory.

```env
# Server Config
SERVER_HOST=smtp.gmail.com
SERVER_EMAIL=your-email@gmail.com
SERVER_PASSWORD=your-app-password
ADMINISTRATOR_1=admin@email.com

# Google OAuth & Service Account (for Calendar & Email)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=your-google-redirect-uri
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
GOOGLE_SERVICE_ACCOUNT_KEY=path/to/service-account.json

# Twitter / X API
TWITTER_APP_KEY=your-twitter-api-key
TWITTER_APP_SECRET=your-twitter-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_REFRESH_TOKEN=your-refresh-token

# GROQ
GROQ_API_KEY=

# Database
DATABASE_URL="postgresql://postgres:aaa@103.197.191.148:5432/appdb?schema=public"

```

> **⚠️ IMPORTANT:** Never expose your credentials publicly. Use environment variables instead.

## 📦 Features
- ✅ Google Calendar Automation
- ✅ Send Smart Emails
- ✅ Twitter/X Bot Integration
- ✅ Natural Language Intent Processing

## 📁 Folder Structure
```
src/
  ├── services/
  ├── helpers/
  ├── middleware/
  ├── app.js
.env
```

## 🧠 Credentials Required
- Google OAuth Credentials
- Google Service Account (Calendar & Gmail)
- Twitter/X App Credentials
- Gmail App Password

## 📜 License
Private - Internal project only
