# CampusCart — Student-to-Student Campus Marketplace

CampusCart is a second-hand marketplace designed exclusively for college students to buy, sell, exchange, or give away textbooks, electronics, dorm furniture, and stationery.

Built with **Next.js 14 (App Router)**, **JavaScript (ES6+)**, **Tailwind CSS**, and **MongoDB Atlas** with **Mongoose**.

---

## Features Implemented

### 1. Foundation & Marketplace UI (Phase 1)
- **Responsive Marketplace Layout:** Header with search and navigation, Hero section, Category navigation, Product grid, and Seller CTA.
- **Modern Design:** Clean, minimal white and emerald green accent palette, mobile-friendly navigation drawer.
- **Component Architecture:** Reusable `ProductCard`, `ProductGrid`, `CategoryNav`, and `Navbar`.

### 2. Functional Marketplace & MongoDB Integration (Phase 2)
- **Mongoose Data Models:**
  - `Listing`: Title, price, category, condition, type (Sale/Free/Exchange), status (Available/Reserved/Sold/Inactive), location, images, seller contacts, and contact preference.
- **RESTful App Router APIs:**
  - `GET /api/health`: Database connection status, ping verification, and live document counts.
  - `GET /api/listings`: Full text search (`?q=`), category filtering (`?category=`), min/max price filtering (`?minPrice=&maxPrice=`), condition, type, and sorting (relevance, price-low, price-high, newest).
  - `POST /api/listings`: Validated listing publication with automated free-item price enforcement ($0).
  - `GET /api/listings/[id]`: Single product details retrieval.
  - `PATCH /api/listings/[id]`: Status updates, deactivation/reactivation, and price adjustments.
  - `DELETE /api/listings/[id]`: Listing deletion.
- **Database Seeder (`npm run seed`):** Idempotent seed script inserting 14 student listings across Books, Electronics, Furniture, Stationery, and Other.

### 3. Enquiries, Offers, Favorites & Dashboard (Phase 3)
- **Buyer & Seller Enquiry System:**
  - `Enquiry` model supporting buyer details, seller matching, message, and optional offer price.
  - `POST /api/enquiries`: Validated enquiry creation with automatic seller email resolution from MongoDB.
  - `PATCH /api/enquiries/[id]`: Seller actions to **Accept Offer**, **Reject Offer**, or mark a deal **Completed**. Automatically updates listing status to `Reserved` or `Sold`.
- **Saved Favorites System:**
  - `Favorite` model with compound unique indexing `{ listingId, visitorId }` preventing duplicates.
  - Client-side persistent visitor ID via `localStorage`.
  - One-click heart toggle on cards and product details.
  - Automatic Sold badge on saved items if the listing was marked Sold.
- **Student Dashboard (`/dashboard`):**
  - **Demo Identity Switcher:** Seamlessly switch between demo student personas (e.g. *Alex Chen*, *David Miller*, *Sophia Patel*) or enter custom student email.
  - **Live Overview Metrics:** Real-time counts for active listings, reserved listings, completed deals, and pending offers.
  - **Recent Activity Feed:** Notifications generated from real enquiry and offer records.
  - **My Listings Management:** Manage listings, edit details (`/sell?edit=[id]`), deactivate/reactivate items, or delete items.
  - **Received Enquiries:** Review buyer offers and accept/reject deals.
  - **Sent Enquiries:** Track statuses of items you asked about.
  - **Favorites:** Review saved items with quick links and remove actions.

### 4. Assignment Compliance & Seller Profiles (Phase 4)
- **Seller Profiles (`/seller/[email]`):**
  - Displays seller name, active listings count, completed deal history count, and active listings grid.
  - Respects contact preference (`Email`, `Phone`, `Either`): hides phone number unless explicitly allowed by preference.
  - Displays transparent disclaimer noting contacts are unauthenticated and student-provided.
- **Similar Items Section:**
  - Product detail page dynamically queries and displays available similar items in the same category excluding the current item.
- **Listing Lifecycle Management:**
  - Safe deactivation toggle (`Inactive`) that removes listings from public search without deleting history.
  - Edit existing listings through `/sell?edit=[id]` pre-populated form.
- **Transparent Relevance Scoring:**
  - Exact title match (100) > Title start (80) > Title contains (60) > Description contains (30) > Recency fallback.
- **21-Step Acceptance Audit:**
  - Comprehensive automated test suite (`npm run test:audit`) covering full marketplace lifecycle end-to-end.

---

## Project Structure

```
campuscart/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── enquiries/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.js
│   │   │   │   └── route.js
│   │   │   ├── favorites/
│   │   │   │   └── route.js
│   │   │   ├── health/
│   │   │   │   └── route.js
│   │   │   └── listings/
│   │   │       ├── [id]/
│   │   │       │   └── route.js
│   │   │       └── route.js
│   │   ├── dashboard/
│   │   │   └── page.js
│   │   ├── marketplace/
│   │   │   └── page.js
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.js
│   │   ├── sell/
│   │   │   └── page.js
│   │   ├── seller/
│   │   │   └── [email]/
│   │   │       └── page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── not-found.js
│   │   └── page.js
│   ├── components/
│   │   ├── CategoryNav.js
│   │   ├── EnquiryForm.js
│   │   ├── FavoriteButton.js
│   │   ├── Footer.js
│   │   ├── Navbar.js
│   │   ├── ProductCard.js
│   │   ├── ProductGrid.js
│   │   ├── SellForm.js
│   │   └── StudentDashboard.js
│   ├── lib/
│   │   ├── mongodb.js
│   │   ├── sampleProducts.js
│   │   └── visitor.js
│   ├── models/
│   │   ├── Enquiry.js
│   │   ├── Favorite.js
│   │   └── Listing.js
│   └── scripts/
│       └── seed.js
├── .env.example
├── .env.local
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
└── tailwind.config.js
```

---

## Getting Started

### 1. Installation
```bash
cd campuscart
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and add your MongoDB Atlas connection string:
```bash
cp .env.example .env.local
```
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campuscart?retryWrites=true&w=majority
```

### 3. Seed Database
Populate 14 initial marketplace listings (idempotent, skips if already seeded):
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## Deployment (Vercel & GitHub)

1. **GitHub:**
   Ensure `.env.local` is listed in `.gitignore` (already configured). Commit and push repository to GitHub.
2. **Vercel:**
   - Import the repository into Vercel.
   - Set Root Directory to `campuscart` (if deploying the subfolder) or repository root.
   - In **Project Settings > Environment Variables**, add `MONGODB_URI` with your MongoDB Atlas connection string.
   - Deploy. Vercel automatically runs `next build` and serves via App Router edge/serverless runtimes.
