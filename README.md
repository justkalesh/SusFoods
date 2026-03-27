<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20Realtime-3ECF8E?logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Gemini%20AI-2.5%20Flash-4285F4?logo=google" alt="Gemini AI">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?logo=tailwindcss" alt="Tailwind">
</p>

<h1 align="center">🍃 SuS-Food 2.0</h1>

<p align="center">
  <b>A B2B food rescue platform connecting surplus food donors with NGOs in real-time.</b><br>
  Reduce food waste • Lower CO₂ emissions • Generate tax benefits
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Business Logic](#-business-logic)

---

## Overview

SuS-Food 2.0 is a full-stack B2B platform that bridges the gap between food surplus generators (restaurants, campus messes, hotels, supermarkets) and food redistribution NGOs. When a business has surplus food nearing expiry, they list it on the platform. NGOs are instantly notified via real-time WebSockets and can claim, track, and receive the food — all while the platform automatically calculates CO₂ savings and generates estimated tax write-off receipts.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                            │
│  Next.js 16 App Router • React 19 • Tailwind CSS 4 • Framer Motion │
├────────────┬──────────────┬──────────────┬─────────────────────────┤
│  Landing   │ Auth (Login/ │   Donor      │     NGO (Receiver)      │
│  Page      │ Register)    │   Dashboard  │     Dashboard           │
│            │              │              │                         │
│            │  6-Step Form │  • Overview  │  • Live Maps (Leaflet)  │
│            │  w/ Org      │  • AI Scan   │  • Claiming Feed (RT)   │
│            │  Details     │  • Manual    │  • Meal Journey Tracker │
│            │              │    Entry     │  • SOS Broadcast        │
│            │              │  • Profile   │  • Profile              │
└────────────┴──────┬───────┴──────┬───────┴──────────┬──────────────┘
                    │              │                   │
              ┌─────▼──────────────▼───────────────────▼─────┐
              │          MIDDLEWARE (middleware.ts)           │
              │   • Session refresh via Supabase SSR         │
              │   • Route protection (/dashboard/* → /auth)  │
              │   • Role-based redirect (business vs ngo)    │
              └──────────────────┬────────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────────┐
           │                     │                         │
    ┌──────▼──────┐    ┌─────────▼────────┐    ┌───────────▼───────────┐
    │ Server      │    │   API Route      │    │    Supabase Cloud     │
    │ Actions     │    │   /api/scan      │    │                       │
    │             │    │                  │    │  ┌─────────────────┐  │
    │ register    │    │  Gemini 2.5      │    │  │   Auth          │  │
    │ Organization│    │  Flash Vision    │    │  │   (JWT + RLS)   │  │
    │ (auth.ts)   │    │  receipt parser  │    │  ├─────────────────┤  │
    │             │    │                  │    │  │   PostgreSQL    │  │
    │ • signUp    │    │  • Image → JSON  │    │  │   • profiles    │  │
    │ • setSession│    │  • Expiry pred.  │    │  │   • organizations│ │
    │ • org insert│    │  • Line items    │    │  │   • food_items  │  │
    └─────────────┘    └──────────────────┘    │  │   • claims      │  │
                                               │  │   • sos_appeals │  │
                                               │  ├─────────────────┤  │
                                               │  │   Realtime      │  │
                                               │  │   (WebSockets)  │  │
                                               │  │   food_items    │  │
                                               │  │   INSERT/UPDATE │  │
                                               │  ├─────────────────┤  │
                                               │  │   DB Trigger    │  │
                                               │  │   on_auth_user  │  │
                                               │  │   _created      │  │
                                               │  └─────────────────┘  │
                                               └───────────────────────┘
```

---

## 🛠 Tech Stack

| Layer             | Technology                                    | Purpose                                              |
| ----------------- | --------------------------------------------- | ---------------------------------------------------- |
| **Framework**     | Next.js 16.2 (App Router, Turbopack)          | SSR, routing, API routes, middleware                 |
| **UI**            | React 19, Tailwind CSS 4, shadcn/ui (Base UI) | Component library, design system                     |
| **Animations**    | Framer Motion 12                              | Page transitions, step animations                    |
| **Icons**         | Lucide React                                  | 500+ consistent SVG icons                            |
| **Charts**        | Recharts 3                                    | Impact analytics area charts                         |
| **Maps**          | Leaflet + React-Leaflet 5                     | Interactive donor location maps                      |
| **Auth**          | Supabase Auth (JWT)                           | Email/password signup, session management            |
| **Database**      | Supabase PostgreSQL                           | Profiles, organizations, food items, claims          |
| **Realtime**      | Supabase Realtime (WebSocket)                 | Live NGO feed updates on INSERT/UPDATE               |
| **AI/ML**         | Google Gemini 2.5 Flash                       | Receipt scanning, item extraction, expiry prediction |
| **Middleware**    | Next.js Edge Middleware                       | Route protection, role-based redirects               |
| **Notifications** | Sonner                                        | Toast notifications for user feedback                |
| **Theming**       | next-themes                                   | Light/dark mode support                              |

---

## ✨ Features

### 🏢 Donor Portal (Business Dashboard)

| Feature                   | Description                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Impact Overview**       | Real-time stats: total food donated (kg), CO₂ saved, estimated tax write-off                                                    |
| **Impact Analytics**      | Monthly CO₂ reduction chart (Recharts area chart)                                                                               |
| **Active Inventory Feed** | Live list of your surplus with countdown timers and freshness indicators                                                        |
| **AI Receipt Scanner**    | Upload a receipt/invoice → Gemini 2.5 Flash extracts line items with predicted expiry dates. Human review table before confirm. |
| **Manual Entry**          | Form to list surplus food with category, quantity, and "safe until" date                                                        |
| **Profile Management**    | Edit business name, type, contact, phone, address — saved to Supabase                                                           |

### 🤝 Receiver Portal (NGO Dashboard)

| Feature                     | Description                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Donor Map**          | Interactive Leaflet map with markers for each available donor. Click to view details and claim directly from the map popup.             |
| **Real-Time Claiming Feed** | Masonry card grid of available food. **Supabase Realtime** WebSocket auto-adds new items and removes claimed ones without page refresh. |
| **Meal Journey Tracker**    | Table tracking claim status: Pending → In Transit → Received                                                                            |
| **SOS Broadcast**           | Emergency broadcast form with urgency levels (High/Medium/Low). Visible to all donors in the Regional Radar.                            |
| **Profile Management**      | Edit organization name, registration number, contact, phone, address                                                                    |

### 🔐 Authentication & Authorization

| Feature                   | Description                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **6-Step Registration**   | Goal selection → Email → Org details → Personal info → Org address + coordinates → Password                                        |
| **DB Auth Trigger**       | PostgreSQL trigger auto-creates a `profiles` row on every signup using `raw_user_meta_data`                                        |
| **Middleware Protection** | All `/dashboard/*` routes require authentication. Logged-in users on `/auth` are auto-redirected to their role-specific dashboard. |
| **Row-Level Security**    | Every table has RLS policies ensuring users can only modify their own data                                                         |

---

## 🗄 Database Schema

```sql
profiles          food_items              claims
┌──────────┐      ┌───────────────────┐   ┌──────────────────┐
│ id (PK)  │◄────►│ donor_id (FK)     │   │ food_item_id (FK)│
│ role     │      │ item_name         │◄──┤ ngo_id (FK)      │
│ name     │      │ category          │   │ status           │
│ org_name │      │ quantity_kg       │   │ claimed_at       │
│ lat/lng  │      │ safe_to_consume   │   └──────────────────┘
│ created  │      │ status            │
└──────────┘      │ created_at        │   sos_appeals
                  └───────────────────┘   ┌──────────────────┐
organizations                             │ ngo_id (FK)      │
┌────────────────┐                        │ request_text     │
│ user_id (FK)   │                        │ urgency          │
│ name           │                        │ date_posted      │
│ legal_name     │                        └──────────────────┘
│ email / phone  │
│ address        │
│ lat / lng      │
│ country        │
│ suite_number   │
│ type           │
└────────────────┘
```

**Key relationships:**

- `profiles.id` → `auth.users.id` (1:1, auto-created by trigger)
- `organizations.user_id` → `profiles.id` (1:1, created during registration)
- `food_items.donor_id` → `profiles.id` (1:many)
- `claims.food_item_id` → `food_items.id` (1:1)
- `claims.ngo_id` → `profiles.id` (many:1)

---

## 📁 Project Structure

```
susfoods2/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (hero, stats, features, CTA)
│   │   ├── layout.tsx                  # Root layout (fonts, theme provider, toaster)
│   │   ├── globals.css                 # Design tokens, animations, utilities
│   │   ├── actions/
│   │   │   └── auth.ts                 # Server action: registration flow
│   │   ├── api/
│   │   │   └── scan/route.ts           # POST: Gemini AI receipt scanner
│   │   ├── auth/
│   │   │   ├── page.tsx                # Login page
│   │   │   └── register/page.tsx       # 6-step registration wizard
│   │   └── dashboard/
│   │       ├── business/
│   │       │   ├── page.tsx            # Donor dashboard (overview, scanner, manual)
│   │       │   ├── profile/page.tsx    # Donor profile page
│   │       │   └── layout.tsx          # Donor layout (sidebar/header)
│   │       └── ngo/
│   │           ├── page.tsx            # NGO dashboard (map, feed, logistics, SOS)
│   │           ├── profile/page.tsx    # NGO profile page
│   │           └── layout.tsx          # NGO layout (sidebar/header)
│   ├── components/
│   │   ├── SmartScanner.tsx            # AI receipt upload + review UI
│   │   ├── donor/
│   │   │   ├── DonorProfileSettings.tsx
│   │   │   ├── ImpactMetrics.tsx
│   │   │   ├── ExpiringStockWarning.tsx
│   │   │   ├── InventoryCountdownTable.tsx
│   │   │   ├── OneClickDonateBtn.tsx
│   │   │   └── AchievementPromo.tsx
│   │   ├── receiver/
│   │   │   ├── DonorMap.tsx            # Leaflet map with live DB pins
│   │   │   ├── NGOProfileSettings.tsx
│   │   │   ├── LiveReceiverAlerts.tsx
│   │   │   ├── OrgTeamManager.tsx
│   │   │   └── VendorMap.tsx
│   │   └── ui/                         # shadcn/ui primitives
│   ├── lib/
│   │   ├── engine.ts                   # Business logic (CO₂ calc, time, tax)
│   │   ├── mock-data.ts               # Type definitions + legacy mock data
│   │   └── utils.ts                    # cn() helper
│   ├── middleware.ts                   # Auth guards + role redirect
│   └── utils/
│       └── supabase/
│           ├── client.ts               # Browser Supabase client
│           └── server.ts               # Server Supabase client
├── supabase_schema.sql                 # Full production DB schema + triggers
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm**
- A **Supabase** project (free tier works)
- A **Google Gemini API Key** (for receipt scanning)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/justkalesh/SusFoods.git
cd SusFoods

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Run the Supabase schema
# Copy the contents of supabase_schema.sql and execute it
# in your Supabase project's SQL Editor.

# 5. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini (for AI Receipt Scanner)
GEMINI_API_KEY=your-gemini-api-key
```

| Variable                        | Required | Description                                                      |
| ------------------------------- | -------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | Your Supabase project URL                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Supabase anonymous/public key                                    |
| `GEMINI_API_KEY`                | Optional | Enables AI receipt scanning. Falls back to mock data if missing. |

---

## 🧠 Business Logic

### Core Engine (`src/lib/engine.ts`)

| Function                         | Formula / Logic                                                 |
| -------------------------------- | --------------------------------------------------------------- |
| `calculateCO2Saved(kg)`          | `kg × 2.5` — every 1 kg of rescued food = 2.5 kg CO₂e prevented |
| `generateTaxReceipt(kg)`         | `kg × $3.50` — estimated 80G tax write-off value per kg         |
| `calculateTimeRemaining(expiry)` | Returns hours remaining + color code: 🟢 >12h, 🟡 2–12h, 🔴 <2h |
| `autoFlagForDonation(expiry)`    | Auto-flags batches expiring within 24h for donation             |

### Food Lifecycle

```
Donor lists food          NGO claims it           Pickup/delivery         Received
     │                         │                       │                     │
     ▼                         ▼                       ▼                     ▼
  ┌──────────┐          ┌──────────┐            ┌──────────┐          ┌──────────┐
  │ Available │ ──────► │ Claimed  │ ─────────► │In Transit│ ───────► │ Delivered│
  └──────────┘          └──────────┘            └──────────┘          └──────────┘
       │                      │
       │ (Realtime WS)        │ (Realtime WS)
       ▼                      ▼
  NGO feed gets          Item removed
  new card               from NGO feed
```

### AI Receipt Scanner Pipeline

```
Image Upload → Gemini 2.5 Flash Vision API → JSON Extraction → Human Review Table → Supabase Insert
                    │
                    ├── Item names
                    ├── Quantities & units
                    ├── Prices
                    └── Predicted expiry (AI-estimated days)
```

### Registration Flow

```
Step 1: Goal (Donor/NGO) → Step 2: Email → Step 3: Org Details (name, type)
→ Step 4: Personal Info (name, phone, language, vehicle)
→ Step 5: Org Address (country, address, lat/lng, suite)
→ Step 6: Password + Terms
     │
     ▼
Server Action: signUp() → DB Trigger creates profiles row
                        → organizations.insert() with full details
                        → Redirect to role-specific dashboard
```

---

<p align="center">
  Built with 💚 for a hunger-free world
</p>
