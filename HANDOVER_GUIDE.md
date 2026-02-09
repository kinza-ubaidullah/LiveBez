# 🚀 LiveBaz - Production Handover & Setup Guide

This document contains the complete technical setup and instructions for managing the **LiveBaz** platform in a production environment.

## 1. Hosting Architecture
- **Frontend & API**: [Vercel](https://vercel.com) (Optimal for Next.js performance)
- **Database**: [Supabase](https://supabase.com) (Recommended) or any PostgreSQL provider.
- **Media/Logos**: [Cloudinary](https://cloudinary.com) (CDN for high-speed images).
- **AI Engine**: Google Gemini API.

## 2. Infrastructure Setup

### A. Domain Configuration (Vercel)
1. Log in to the Vercel Dashboard.
2. Navigate to **Project Settings > Domains**.
3. Add your production domain (e.g., `livebaz.com`).
4. Update your DNS settings (A record/CNAME) as provided by Vercel.

### B. Database Migration (Prisma)
Since we are using a standalone PostgreSQL database:
1. Create a new project on **Supabase**.
2. Go to **Project Settings > Database** and copy the **Connection String (Transaction Mode)**.
3. Update the `DATABASE_URL` in Vercel Environment Variables.
4. Run the following command locally to sync the schema:
   ```bash
   npx prisma db push
   ```

### C. Environment Variables (Required)
Ensure these are set in the Vercel Dashboard (**Settings > Environment Variables**):

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | A secure random string for session encryption |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://livebaz.com`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `GEMINI_API_KEY` | Google AI API Key for predictions |

---

## 3. Admin Panel Access
The website is equipped with a premium administration dashboard to manage matches, leagues, bookmakers, and articles.

- **Admin Login URL**: `https://your-domain.com/admin/login`
- **Default Email**: `admin@livebaz.com`
- **Default Password**: `AdminPassword123!`
- **Action Required**: Change the password immediately after the first login for security.

---

## 4. Key Performance Features

### 🖋️ Premium Typography
The site uses **Inter** for high readability and **Outfit** for premium, bold headings. This combination ensures a "clean" and high-end look.

### 🖼️ SmartLogo System
We have implemented a **SmartLogo** system.
- **Problem**: External sports logos often break (404/403 errors).
- **Solution**: If a logo fails to load, the system automatically replaces it with a beautiful, stylized text-based brand mark. This prevents the website from looking "broken" to users.

### 🔐 Multi-Role Auth
- **Regular Users**: Can register and verify their email to access predictions.
- **Admin Users**: Have full control over the platform content.

---

## 5. Maintenance
- **Syncing Matches**: The system automatically attempts to sync match data upon navigation.
- **Cleaning Cache**: Vercel handles most caching, but if data seems old, you can trigger a "Redeploy" in the Vercel dashboard.

---
*Developed by Antigravity AI*
