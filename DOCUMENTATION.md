# LiveBaz Platform Documentation

## 🚀 Project Overview
LiveBaz is a high-fidelity sports analysis and prediction platform built for professional bettors and football fans. It features real-time data synchronization, AI-generated tactical analysis, and full multilingual support (English, Arabic, Persian).

---

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Prisma ORM)
- **Styling**: Tailwind CSS (Premium Dark/Light Aesthetic)
- **Language**: TypeScript
- **AI**: Google Gemini 1.5 Flash
- **Data APIs**: 
  - **The Odds API**: For match probabilities and betting markets.
  - **API-Sports (API-Football)**: For live scores, lineups, fixtures, and team logos.

---

## ✅ Working Features (Implementation Complete)

### 1. Real-Time Data Ecosystem
- **Automatic Matching**: The system syncs matches from The Odds API and enriches them with logos and live data from API-Sports.
- **Background Sync**: Every 5 minutes, the system checks for score updates and new betting odds automatically.

### 2. Multilingual Infrastructure (i18n)
- **Supported Languages**: English (`en`), Arabic (`ar`), Persian (`fa`).
- **SEO Optimization**: Each language has its own slug system (e.g., `/en/league/premier-league` vs `/fa/league/premier-league-fa`).
- **Dynamic Translation**: Database models (Leagues, Matches, Articles) support nested translations.

### 3. AI Match Analysis (Gemini 1.5)
- **Technical Analysis**: Admin can generate 400+ word tactical previews using Google Gemini based on real match stats.
- **Smart Fallback**: If the AI limit is reached or the key is missing, the system uses a high-quality deterministic template.

### 4. Admin Command Center (`/admin`)
- **League Manager**: Featured toggle (Star icon) allows admins to decide which leagues appear in the primary Navbar dropdown.
- **Match Editor**: Change probabilities, update scores, or generate AI analysis.
- **Content Archive**: Full management of blog posts and categories.

### 5. Advanced Frontend Components
- **Prediction Hub**: Categories like "Home Win Mastery", "BTTS", and "Over 2.5" sorted by algorithmic probability.
- **Live Ticker**: Global context for all active matches.
- **Premium Aesthetics**: Glassmorphism, tailored gradients, and high-density layouts.

---

## ⏳ Pending / Client Requirements (Empty Sections)

The following areas are currently "empty" or contain placeholder logic because they depend on final content/credentials from the **Client**:

### 1. Editorial Content (Articles)
- **Status**: The blog system is fully functional, but the database was cleaned of mock data.
- **Requirement**: Client needs to write and publish real sports articles through the Admin Panel.

### 2. Legal & Static Pages
- **Status**: Footer links for **About Us**, **Privacy Policy**, and **Terms of Service** currently point to `#`.
- **Requirement**: Client must provide the legal text for these pages to be implemented.

### 3. Bookmaker Partner Data
- **Status**: The system supports bookmaker listings with ratings and affiliate links.
- **Requirement**: Client needs to provide the real list of bookmakers, their affiliate URLs, and preferred ratings.

### 4. Team Profile Depth
- **Status**: Teams are created automatically during sync with basic info and logos.
- **Requirement**: Additional details like stadium info or team history need to be filled manually if desired.

---

## ❌ Future Roadmap (Not Yet Implemented)
- **Payment Gateway**: Integration with Stripe/PayPal for "PRO" user plans.
- **User Engagement**: Comments section for matches and articles.
- **Advanced Dashboard**: Personalized "Followed Leagues" for logged-in users.
- **Push Notifications**: Real-time browser alerts for goal scores.

---

## 🧪 Testing Guidelines
1. **Sync**: Check `/api/sync/matches` to trigger a manual data refresh.
2. **Admin**: Use `admin@livebaz.com` / `admin123` to access management tools.
3. **Locale**: Append `/fa` or `/ar` to the URL to test Right-to-Left (RTL) layout.
