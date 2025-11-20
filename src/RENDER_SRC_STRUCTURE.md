# ✅ Backend Moved to `src/` Directory

## 📁 **New Structure:**

```
job-portal-backend/
├── .env                  ← Stays at root (or move to src/ if needed)
├── vercel.json          ← Stays at root
└── src/                  ← ALL code AND package.json moved here
    ├── package.json      ← MOVED HERE
    ├── package-lock.json ← MOVED HERE
    ├── server.js
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── utils/
    ├── services/
    └── cron/
```

## ✅ **Updated Files:**

1. **`src/package.json`** - Scripts point to `server.js` (no `src/` prefix needed):
   - `"start": "node server.js"`
   - `"dev": "nodemon server.js"`
   - `"main": "server.js"`

2. **All code moved to `src/`** - Relative imports still work

## 🚀 **Render Configuration:**

### **Root Directory:**
Set to: `src`

### **Build Command:**
```
npm install
```

### **Start Command:**
```
npm start
```
(This will run `node server.js` from within `src/`)

### **Environment Variables:**
- If `.env` is at root, Render might not find it
- **Option 1:** Move `.env` to `src/` (or set env vars in Render dashboard)
- **Option 2:** Keep `.env` at root and ensure Render can access it

## ✅ **What Changed:**

- ✅ All backend code moved to `src/` directory
- ✅ `package.json` moved to `src/` directory
- ✅ `package-lock.json` moved to `src/` directory
- ✅ Scripts updated (no `src/` prefix since we're already in `src/`)
- ✅ All relative imports still work (they're within `src/`)

## 🧪 **Test Locally:**

```bash
cd /Users/weblib/Desktop/job-portal-backend/src
npm start
```

Should work exactly as before!

## ⚠️ **Important for Render:**

1. **Root Directory:** Set to `src` in Render dashboard
2. **Environment Variables:** Add all `.env` variables in Render's Environment tab
3. **Build/Start Commands:** Use `npm install` and `npm start` (no path needed)

---

**Status:** ✅ Backend restructured for Render deployment with `src/` as root
