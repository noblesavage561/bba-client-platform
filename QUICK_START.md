# 🚀 Railway Deployment Quick Start

**Time to Deploy**: ~15 minutes  
**Backup Created**: March 12, 2026 @ 00:22:38 UTC

---

## Pre-Flight Checklist

- [x] Code changes complete
- [x] Backup created (205MB + 573KB)
- [x] Dependencies installed
- [x] Documentation written
- [ ] **Ready to deploy!**

---

## 5-Step Deployment

### 1️⃣ Create Railway Project (3 min)

```
1. Go to railway.app/new
2. Click "Deploy from GitHub repo"
3. Select: NobleSavageGlobal/bba-client-platform
4. Wait for initial build
```

### 2️⃣ Add PostgreSQL (1 min)

```
1. In project → Click "New"
2. Select "Database" → "Add PostgreSQL"
3. Link to web service
4. DATABASE_URL auto-created ✓
```

### 3️⃣ Set Environment Variables (5 min)

Copy-paste these into Railway Variables tab:

```bash
# Auth
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.railway.app

# AI (OpenRouter)
OPENROUTER_API_KEY=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
NEXT_PUBLIC_AI_ENABLED=true

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
```

**Get OpenRouter Key**: [openrouter.ai/keys](https://openrouter.ai/keys)

### 4️⃣ Initialize Database (2 min)

In Railway terminal or locally:

```bash
railway run npx prisma db push --schema=packages/db/prisma/schema.prisma
```

### 5️⃣ Verify & Test (4 min)

```
✓ Check deployment logs (no errors)
✓ Visit your Railway URL
✓ Test login
✓ Upload a document
✓ Verify AI processing
```

---

## 🔑 Required Secrets

| Secret | Where to Get It |
|--------|----------------|
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Railway app URL |
| `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `SMTP_PASS` | Gmail: [App Passwords](https://myaccount.google.com/apppasswords) |

---

## 📱 Quick Commands

### Local Testing
```bash
# Install dependencies
npm install

# Set environment variables
cp apps/web/.env.example apps/web/.env
# Edit .env with your keys

# Generate Prisma client
npx prisma generate --schema=packages/db/prisma/schema.prisma

# Start dev server
npm run dev
```

### Railway CLI
```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run commands
railway run <command>
```

---

## 🐛 Common Issues

| Problem | Quick Fix |
|---------|-----------|
| Build fails | Check build command includes `prisma generate` |
| 401 errors | Verify `OPENROUTER_API_KEY` set correctly |
| Database errors | Run `prisma db push` to initialize schema |
| AI disabled | Set `NEXT_PUBLIC_AI_ENABLED="true"` (string!) |

---

## 💰 Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Railway Hobby | $5 |
| OpenRouter API (100 clients) | ~$20-40 |
| **Total** | **~$25-45/month** |

---

## 📚 Full Documentation

- **Deployment Guide**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
- **AI Features**: [AI_INTEGRATION.md](AI_INTEGRATION.md)
- **Migration Details**: [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)

---

## 🆘 Need Help?

**Railway Issues**: [docs.railway.app](https://docs.railway.app)  
**OpenRouter Issues**: [openrouter.ai/docs](https://openrouter.ai/docs)  
**Prisma Issues**: [pris.ly/d/help](https://pris.ly/d/help)

---

## ✅ Post-Deployment

After successful deployment:

1. ✓ Set up billing alerts (OpenRouter dashboard)
2. ✓ Configure custom domain (optional)
3. ✓ Test all features end-to-end
4. ✓ Monitor logs for first 24 hours
5. ✓ Document any custom configuration

---

**Status**: ✅ Ready to Deploy  
**Confidence**: 🟢 High (all changes tested, backups secured)
