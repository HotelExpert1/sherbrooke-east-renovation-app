# 🌐 Hosting Instructions

This folder contains everything needed to deploy the Sherbrooke East Renovation App.

## Files

| File | Purpose |
|------|--------|
`index.html` | App UI + logic |
`_redirects` | Netlify SPA mode |
`netlify.toml` | Netlify config |

---

## 📦 Upload Flow

### Option 1 — GitHub + Netlify ✅
1. Create new GitHub repo
2. Upload these files
3. Connect repo to Netlify

Settings:
- **Build command:** *(empty)*
- **Publish directory:** `.`
- Enable `_redirects` + `netlify.toml`

### Option 2 — Drag & Drop to Netlify UI
Go to https://app.netlify.com/drop  
Upload this whole folder.

---

## ✅ Done!
Your app will deploy at:  
`https://<your-site>.netlify.app`

