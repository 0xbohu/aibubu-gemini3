# Troubleshooting Guide 🔧

This guide helps resolve common issues when setting up and running AI Bubu.

## 🚨 Environment Variables Issues

### **Error: "supabaseKey is required"**

**Symptoms**:
```
Unhandled Runtime Error
Error: supabaseKey is required.
Source: src/lib/supabase.ts
```

**Root Cause**: Environment variables not loading properly

**Solutions**:

#### 1. **Verify .env.local exists and has correct values**
```bash
# Check if file exists
ls -la .env.local

# Check contents (be careful not to share these publicly!)
cat .env.local
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."
```

#### 2. **Restart Development Server**
```bash
# Kill current server (Ctrl+C)
# Then restart
npm run dev
```

#### 3. **Check File Location**
- `.env.local` must be in the **project root** (same level as `package.json`)
- NOT in `src/` or any subdirectory

#### 4. **Verify Variable Names**
- Must use exact names: `NEXT_PUBLIC_SUPABASE_URL`
- Must include quotes for URLs: `NEXT_PUBLIC_SUPABASE_URL="https://..."`

#### 5. **Clear Next.js Cache**
```bash
rm -rf .next
npm run dev
```

## 🗄️ Database Connection Issues

### **Error: "Failed to create account" or "Profile creation error"**

**Symptoms**:
- User signup fails
- Database connection errors
- RLS policy violations

**Solutions**:

#### 1. **Run Database Setup**
```sql
-- In Supabase SQL Editor, run:
-- Contents of database_setup_simple.sql
```

#### 2. **Check RLS Policies**
```sql
-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'players';
```

#### 3. **Test Database Connection**
- Go to Supabase Dashboard → Settings → API
- Verify URL and keys match your `.env.local`

## 🤖 Google AI Integration Issues

### **Error: "Google AI API key not found"**

**Solutions**:

#### 1. **Get Google AI Studio API Key**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create account and get API key
3. Add to `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy..."
```

#### 2. **Test API Key**
```bash
# Test in terminal (replace with your key)
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

## 📦 Build and Development Issues

### **Error: "Module not found" or TypeScript errors**

**Solutions**:

#### 1. **Reinstall Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. **Check TypeScript**
```bash
npm run build
```

#### 3. **Clear All Caches**
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## 🔐 Authentication Issues

### **Users Can't Sign Up or Login**

**Solutions**:

#### 1. **Check Supabase Auth Settings**
- Go to Supabase Dashboard → Authentication → Settings
- Ensure "Enable email confirmations" is OFF for development
- Check allowed redirect URLs

#### 2. **Verify User Creation**
- Check Supabase Dashboard → Authentication → Users
- See if users are being created

#### 3. **Check Browser Console**
- Open Developer Tools → Console
- Look for detailed error messages

## 🚀 Deployment Issues

### **Works locally but fails in production**

**Solutions**:

#### 1. **Environment Variables in Production**
- Add all env vars to your hosting platform (Vercel, Netlify, etc.)
- Don't include quotes in production env vars
- Restart deployment after adding vars

#### 2. **Database Setup**
- Ensure production database has all tables and policies
- Run `database_setup_simple.sql` in production Supabase

## 🔄 Quick Fix Checklist

When something isn't working, try these in order:

- [ ] **Restart dev server**: `Ctrl+C` then `npm run dev`
- [ ] **Check `.env.local`**: File exists, correct variables, correct location
- [ ] **Clear cache**: `rm -rf .next && npm run dev`
- [ ] **Reinstall**: `rm -rf node_modules && npm install`
- [ ] **Check console**: Browser dev tools for detailed errors
- [ ] **Test database**: Supabase dashboard → SQL Editor → simple query
- [ ] **Verify API keys**: Test in respective platforms (Google AI Studio, Supabase)

## 📞 Getting Help

### **Still having issues?**

1. **Check error details**:
   - Full error message
   - Browser console logs
   - Terminal output

2. **Provide context**:
   - Operating system
   - Node.js version: `node --version`
   - NPM version: `npm --version`
   - What you were trying to do when error occurred

3. **Common quick fixes**:
   - Restart computer (clears all caches)
   - Try in incognito/private browser window
   - Check if ports 3000-3010 are available

### **Environment Setup Verification**

Create a simple test to verify everything is working:

1. **Start the app**: `npm run dev`
2. **Visit homepage**: http://localhost:3000 (or shown port)
3. **Click "Start Learning"**: Should go to signup page
4. **Try signup**: Use test credentials
5. **Check success**: Should redirect to dashboard

If any step fails, use the troubleshooting steps above for that specific issue.

---

**💡 Pro Tip**: Most issues are resolved by restarting the development server and ensuring environment variables are correctly configured!