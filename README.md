# CampusCart — Student-to-Student Campus Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14.2.18-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.15-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Mongoose_8.8.1-green?logo=mongodb)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript_ES6+-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

CampusCart is a modern, responsive web marketplace designed exclusively for college and university students to discover, buy, sell, exchange, or give away second-hand textbooks, electronics, dorm furniture, stationery, and campus gear.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Proposed Solution](#proposed-solution)
4. [Key Features](#key-features)
5. [Tech Stack](#tech-stack)
6. [Project Folder Structure](#project-folder-structure)
7. [Installation & Local Setup](#installation--local-setup)
8. [Environment Variables](#environment-variables)
9. [Database Setup & Seeding](#database-setup--seeding)
10. [Application Routes & API Documentation](#application-routes--api-documentation)
11. [Screenshots](#screenshots)
12. [Future Improvements](#future-improvements)
13. [License](#license)

---

## Project Overview

College students cycle through substantial amounts of course materials and personal equipment each semester—expensive textbooks that are only needed for a single class, electronics like scientific calculators and monitors, stationery, and dorm furniture. 

**CampusCart** provides a dedicated, clean, and centralized marketplace for students to trade directly with peers on their own campus. Built using the **Next.js 14 App Router**, **Tailwind CSS**, and **MongoDB Atlas with Mongoose**, CampusCart offers an intuitive interface modeled after contemporary marketplaces like Facebook Marketplace, with a calm white and emerald-green aesthetic.

---

## Problem Statement

### Second-Hand Marketplace for Students

Students frequently have unused textbooks, electronics, dorm furniture, stationery, and other equipment that could provide immediate value to fellow students. However, they lack a dedicated, convenient, and trusted platform to buy, sell, exchange, or give away these goods within their campus community.

### Key Challenges
- **Affordability:** Traditional retail and campus bookstore prices for textbooks and course supplies impose heavy financial burdens on students.
- **Lack of a Centralized Hub:** Peer-to-peer student commerce is scattered across informal WhatsApp group chats, social media threads, and physical bulletin boards.
- **Inefficient Communication:** Connecting buyers and sellers without structured listing details leads to repetitive questions about price, condition, and pickup location.
- **Unorganized Enquiries & Offers:** Students have no structured mechanism to submit price offers, track whether an offer was accepted, or manage negotiation states.
- **Limited Activity Visibility:** Sellers lack insight into which items are active, reserved, or sold, and buyers cannot easily track their saved items or open inquiries.

---

## Proposed Solution

CampusCart solves these challenges by providing a purpose-built platform with dedicated workflows:

- **Structured Listings:** Students publish rich listings with title, description, category, condition tier, pickup location, image URLs with fallback previews, and contact preferences.
- **Multiple Listing Types:** Supports direct **Sale**, **Free Giveaway**, and **Exchange / Trade** to accommodate all student reuse needs.
- **Discovery Engine:** Combines real-time text search (across title and description), category filtering, price range boundaries, condition filtering, and transparent relevance ranking.
- **Contextual Recommendations:** Product detail pages dynamically display similar active items in the same category, excluding the item currently being viewed.
- **Dedicated Seller Profiles:** Public seller views (`/seller/[email]`) summarize a student's active items and completed sales history, with contact privacy controls.
- **Enquiry & Offer Lifecycle:** Buyers submit inquiries with optional price counter-offers; sellers review offers on their dashboard and can transition inquiries between `Pending`, `Accepted`, `Rejected`, and `Completed`.
- **Automated Inventory Synchronization:** Accepting an offer automatically marks the listing as `Reserved`; completing a deal marks the listing as `Sold`.
- **Saved Favorites:** Students bookmark items using persistent local visitor tracking with duplicate prevention.
- **Student Dashboard:** An overview displaying live MongoDB metrics, listing management (edit/deactivate/delete), incoming/outgoing inquiries, and an activity notification feed.

---

## Key Features

### 1. Marketplace Discovery & Search
- Full-text search matching item titles and descriptions.
- Category filtering: **Books**, **Electronics**, **Furniture**, **Stationery**, **Other**.
- Condition filtering: **Brand New**, **Like New**, **Gently Used**, **Fair**.
- Minimum and maximum price range boundaries (`?minPrice=&maxPrice=`).
- Multiple sort modes:
  - **Relevance:** Exact title match (100) > Title start (80) > Title contains (60) > Description contains (30) > Recency fallback.
  - **Price:** Low to High, High to Low.
  - **Date:** Newest, Oldest.
- URL query parameter synchronization for shareable search states.

### 2. Listing Lifecycle Management
- **Create Listings:** Multi-field form with client-side validation, image URL preview, and automated $0 enforcement for Free giveaways.
- **Edit Listings:** Pre-populated edit mode at `/sell?edit=[id]`.
- **Safe Deactivation:** Sellers can deactivate (`Inactive`) listings to hide them from public discovery without deleting their transaction history.
- **Status Tracking:** Explicit inventory badges: `Available`, `Reserved`, `Sold`.
- **Deletion:** Permanent deletion with modal confirmation.

### 3. Dedicated Seller Profiles
- Route: `/seller/[email]`
- Displays seller name, active listings count, completed sales history count, and active inventory grid.
- **Privacy Rule:** Seller phone number is only rendered if the seller explicitly chose `Phone` or `Either` as their contact preference; hidden if `Email` only.
- Unauthenticated seller disclaimer banner for student security.

### 4. Enquiries, Offers & Notifications
- Buyers submit questions and optional counter-offer prices.
- Sellers can **Accept**, **Reject**, or mark deals **Completed**.
- Automated side-effects synchronize listing status to `Reserved` or `Sold`.
- **Buyer-Facing Notifications:** Real-time activity notifications rendered in the buyer's Overview dashboard whenever a seller accepts or completes an offer.

### 5. Saved Favorites
- Heart icon toggle on all product cards and detail pages.
- Persistent visitor identification via `localStorage`.
- Compound unique index `{ listingId, visitorId }` preventing duplicate entries.
- Automatic `Sold Out` badges in the favorites view when a saved item sells.

### 6. Interactive Student Dashboard
- **Demo Identity Switcher:** Test the application from multiple perspectives (*Alex Chen*, *David Miller*, *Sophia Patel*) or enter any custom student email.
- **Real Metrics:** Live counts for Active listings, Reserved items, Completed deals, Received inquiries, Sent inquiries, and Pending price offers.
- **Four Dedicated Tabs:** Overview & Notifications, My Listings, Received Enquiries, Sent Enquiries, and Saved Favorites.

### 7. Modern & Mobile-Responsive UI
- Responsive layout across mobile (375px/414px), tablet (768px), and desktop (1280px+).
- Mobile navigation drawer with hamburger toggle.
- Horizontally scrollable category pills and dashboard navigation tabs.
- Multi-column responsive product grids (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) | `14.2.18` | App Router, SSR, Server Components & Route Handlers |
| **UI Library** | [React](https://react.dev/) | `18.3.1` | Component architecture & client-side state |
| **Language** | [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) | ES6+ | Native modern JavaScript (no TypeScript) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `3.4.15` | Utility-first CSS framework with PostCSS |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud | Scalable NoSQL document database |
| **ODM** | [Mongoose](https://mongoosejs.com/) | `8.8.1` | Schema modeling, validation, and connection caching |
| **Icons** | [Lucide React](https://lucide.dev/) | `0.460.0` | Modern, clean UI vector icons |

---

## Project Folder Structure

```
campuscart/
├── public/                         # Static assets and legacy favicon fallback
│   └── favicon.ico                 # 32x32 multi-resolution browser icon
│
├── src/
│   ├── app/                        # Next.js 14 App Router directory
│   │   ├── api/                    # RESTful server-side Route Handlers
│   │   │   ├── enquiries/          # Inquiries and offer management
│   │   │   │   ├── [id]/route.js   # GET single inquiry, PATCH status (Accept/Reject/Complete)
│   │   │   │   └── route.js        # GET buyer/seller inquiries, POST new inquiry
│   │   │   ├── favorites/          # Saved favorites endpoints
│   │   │   │   └── route.js        # GET favorites, POST save, DELETE remove
│   │   │   ├── health/             # System and database diagnostics
│   │   │   │   └── route.js        # GET connection health, Atlas ping, document counts
│   │   │   └── listings/           # Marketplace listings endpoints
│   │   │       ├── [id]/route.js   # GET single listing, PATCH update, DELETE listing
│   │   │       └── route.js        # GET filtered/sorted listings, POST create listing
│   │   │
│   │   ├── dashboard/              # Student dashboard page
│   │   │   └── page.js             # Renders the full StudentDashboard component
│   │   ├── marketplace/            # Discovery and search page
│   │   │   └── page.js             # Filter controls, search bar, and dynamic product grid
│   │   ├── product/                # Single product detail route
│   │   │   └── [id]/page.js        # Server-rendered details, seller card, and similar items
│   │   ├── sell/                   # Listing creation & editing route
│   │   │   └── page.js             # Renders the unified SellForm component
│   │   ├── seller/                 # Public seller profiles route
│   │   │   └── [email]/page.js     # Seller statistics, contact rules, and listing history
│   │   │
│   │   ├── globals.css             # Tailwind base styles and custom utility classes
│   │   ├── icon.png                # App Router 32x32 raster favicon
│   │   ├── icon.svg                # App Router vector favicon (emerald shopping bag logo)
│   │   ├── layout.js               # Root application layout (Navbar, metadata, Footer)
│   │   ├── not-found.js            # Custom 404 page with return-to-marketplace navigation
│   │   └── page.js                 # Homepage with hero section and featured listings
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── CategoryNav.js          # Horizontal category scroll bar with active indicators
│   │   ├── EnquiryForm.js          # In-page enquiry submission form with offer price input
│   │   ├── FavoriteButton.js       # Heart button for saving items with optimistic toggle
│   │   ├── Footer.js               # Site footer with brand info and quick links
│   │   ├── Navbar.js               # Header navigation, live search input, and mobile menu
│   │   ├── ProductCard.js          # Marketplace listing card with tags, price, and location
│   │   ├── ProductGrid.js          # Adaptive responsive grid container for product cards
│   │   ├── SellForm.js             # Form for publishing new items or editing existing listings
│   │   └── StudentDashboard.js     # Multi-tab student workspace and demo persona manager
│   │
│   ├── lib/                        # Shared utility libraries
│   │   ├── mongodb.js              # Reusable MongoDB connection utility with dev caching
│   │   ├── sampleProducts.js       # Baseline demonstration items for initial UI tests
│   │   └── visitor.js              # Client-side persistent visitor identification
│   │
│   ├── models/                     # Mongoose database schemas
│   │   ├── Enquiry.js              # Inquiries, offer prices, and status transitions
│   │   ├── Favorite.js             # User favorites with compound unique index
│   │   └── Listing.js              # Second-hand product listings with enums and validation
│   │
│   └── scripts/                    # Database administrative utilities
│       └── seed.js                 # Idempotent database seeder (populates 14 student items)
│
├── .env.example                    # Template for required environment variables
├── .gitignore                      # Comprehensive rules protecting secrets, logs & cache
├── jsconfig.json                   # Path alias configuration (@/* -> ./src/*)
├── next.config.js                  # Next.js webpack and serverComponent configuration
├── package.json                    # Project dependencies, metadata, and scripts
├── package-lock.json               # Deterministic dependency tree lockfile
├── postcss.config.js               # PostCSS configuration for Tailwind CSS
├── README.md                       # Comprehensive project documentation
└── tailwind.config.js              # Tailwind theme, typography, and color extensions
```

---

## Installation & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher (Node 20+ recommended).
- **npm**: `v9.0.0` or higher.
- **MongoDB Atlas**: A free-tier MongoDB Atlas cluster (or compatible local MongoDB instance).

### 2. Clone the Repository
```bash
git clone https://github.com/DhruvOzha85/CampusCart.git
cd CampusCart
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Open `.env.local` in your editor and configure your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campuscart?retryWrites=true&w=majority
```
*(Replace `<username>` and `<password>` with your database user credentials. Do not commit `.env.local`.)*

### 5. Seed the Database
Populate the database with 14 realistic initial student listings across Books, Electronics, Furniture, Stationery, and Other:
```bash
npm run seed
```
*Note: Seeding is idempotent and skips insertion if listings already exist in the database.*

### 6. Start the Development Server
```bash
npm run dev
```

### 7. Open the Application
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

The application requires only one environment variable:

| Variable | Required | Description | Example Placeholder |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Yes** | Standard MongoDB Atlas connection string with database name (`campuscart`) | `mongodb+srv://user:pass@cluster.mongodb.net/campuscart?retryWrites=true&w=majority` |

### Security Guidelines
> [!CAUTION]
> Never commit `.env.local` or push actual database credentials to GitHub. `.env.local` is included in `.gitignore` and must remain local to your machine or entered as an encrypted secret in your Vercel project settings.

---

## Database Setup & Seeding

### Connection Utility
The MongoDB connection is managed in [`src/lib/mongodb.js`](src/lib/mongodb.js). It uses a cached connection on `global.mongoose` during development to prevent connection exhaustion during Next.js Fast Refresh hot-reloading.

### Database Seeding
To populate initial listings:
```bash
npm run seed
```
- **File:** [`src/scripts/seed.js`](src/scripts/seed.js)
- **Behavior:** Checks the `campuscart` database for existing listings. If documents exist, it safely skips insertion to preserve user edits. If empty, it creates 14 diverse student listings.

### Connection Verification
Verify that your database connection is active and healthy by visiting the health endpoint in your browser or terminal:
```bash
curl http://localhost:3000/api/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "name": "campuscart",
    "ping": "success",
    "listingsCount": 14
  }
}
```

---

## Application Routes & API Documentation

### Application Pages

| Route | Page Name | Description |
| :--- | :--- | :--- |
| `/` | **Homepage** | Hero introduction, category quick-jump, and featured recent listings |
| `/marketplace` | **Marketplace** | Search by keyword, filter by category/price/condition, and sort |
| `/product/[id]` | **Product Details** | Complete item specifications, seller info, and similar category listings |
| `/sell` | **Post / Edit Item** | Create new listings or edit existing listings (`/sell?edit=[id]`) |
| `/seller/[email]` | **Seller Profile** | Public seller overview, contact preferences, and listing history |
| `/dashboard` | **Student Dashboard** | Switch demo personas, view metrics, and manage listings/enquiries |

---

### REST API Endpoints

#### 1. System Health
- **`GET /api/health`**
  - **Purpose:** Verifies application status, MongoDB Atlas connectivity, and document counts.
  - **Response:** `{ status: "healthy", database: { connected: true, name: "campuscart", listingsCount: 14 } }`

#### 2. Marketplace Listings
- **`GET /api/listings`**
  - **Purpose:** Query listings from MongoDB with filtering, searching, and sorting.
  - **Query Parameters:**
    - `q` *(string)*: Search keyword in title or description.
    - `category` *(string)*: Books, Electronics, Furniture, Stationery, Other.
    - `condition` *(string)*: Brand New, Like New, Gently Used, Fair.
    - `type` *(string)*: Sale, Free, Exchange.
    - `status` *(string)*: Available (default), Reserved, Sold, or `all`.
    - `minPrice` / `maxPrice` *(number)*: Price boundary filters.
    - `sort` *(string)*: `relevance`, `price-low`, `price-high`, `newest`, `oldest`.
- **`POST /api/listings`**
  - **Purpose:** Create a new listing.
  - **Payload:** `{ title, description, price, category, condition, type, location, images, sellerName, sellerEmail, sellerPhone, contactPreference }`
- **`GET /api/listings/[id]`**
  - **Purpose:** Fetch a single listing by its MongoDB ObjectId.
- **`PATCH /api/listings/[id]`**
  - **Purpose:** Update listing fields, adjust price, deactivate (`status: "Inactive"`), or reactivate (`status: "Available"`).
- **`DELETE /api/listings/[id]`**
  - **Purpose:** Permanently remove a listing.

#### 3. Enquiries & Offers
- **`GET /api/enquiries`**
  - **Purpose:** Fetch inquiries filtered by `sellerEmail` or `buyerEmail`.
- **`POST /api/enquiries`**
  - **Purpose:** Submit a buyer enquiry with an optional counter-offer price.
  - **Payload:** `{ listingId, buyerName, buyerEmail, message, offerPrice }`
- **`GET /api/enquiries/[id]`**
  - **Purpose:** Retrieve a single enquiry with populated listing details.
- **`PATCH /api/enquiries/[id]`**
  - **Purpose:** Transition enquiry status (`Accepted`, `Rejected`, `Completed`). Automatically synchronizes the listing status to `Reserved` or `Sold`.

#### 4. Favorites
- **`GET /api/favorites`**
  - **Purpose:** List saved favorites for a given `visitorId` or `userEmail`.
- **`POST /api/favorites`**
  - **Purpose:** Save an item to favorites (enforces duplicate prevention).
  - **Payload:** `{ listingId, visitorId }`
- **`DELETE /api/favorites`**
  - **Purpose:** Remove an item from favorites (`?listingId=...&visitorId=...`).

---

## Screenshots

### Homepage
![CampusCart Homepage](public/screenshots/homepage.png)

### Marketplace
![CampusCart Marketplace](public/screenshots/marketplace.png)

### Product Details
![Product Details](public/screenshots/product-details.png)

### Sell Item
![Sell Item](public/screenshots/sell-item.png)

### Seller Profile
![Seller Profile](public/screenshots/seller-profile.png)

### Student Dashboard
![Student Dashboard](public/screenshots/dashboard.png)

---

## Future Improvements

The following items are potential future enhancements for CampusCart:

1. **Campus Email Verification & SSO:** Integrate NextAuth or Clerk with OAuth restricted to verified institutional `.edu` domains.
2. **Direct In-App Messaging:** Replace email-based correspondence with a real-time, socket-based chat interface.
3. **Direct Image Uploads:** Integrate cloud media storage (e.g., Cloudinary, UploadThing, or AWS S3) for native file uploads alongside image URLs.
4. **Push & Email Notifications:** Automated transactional emails (via Resend or SendGrid) when a seller accepts or rejects a price offer.
5. **Campus Map Pickup Points:** Interactive campus map for selecting standardized on-campus pickup spots (student center, library, dining halls).

---

## License

This project is currently unlicensed. All rights reserved by the author. For educational, non-commercial, or academic review only. Contact the repository owner for licensing terms or reuse permissions.
