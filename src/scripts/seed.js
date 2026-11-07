const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value.trim();
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not set in .env.local or environment.");
  process.exit(1);
}

// Minimal inline schema definition to run standalone without Babel/ESM transpilation
const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Books", "Electronics", "Furniture", "Stationery", "Other"],
    },
    condition: {
      type: String,
      required: true,
      enum: ["Brand New", "Like New", "Gently Used", "Fair"],
    },
    type: {
      type: String,
      enum: ["Sale", "Free", "Exchange"],
      default: "Sale",
    },
    status: {
      type: String,
      enum: ["Available", "Reserved", "Sold"],
      default: "Available",
    },
    images: { type: [String], default: [] },
    location: { type: String, required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerPhone: { type: String, default: "" },
  },
  { timestamps: true }
);

const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

const SAMPLE_LISTINGS = [
  {
    title: "Campbell Biology (12th Edition) - Hardcover",
    description: "Used for BIO 101 last semester. Clean pages, no highlighting, includes online access code sheet (unused). Perfect for first year pre-med or bio majors.",
    price: 45.0,
    category: "Books",
    condition: "Like New",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Science Quad / North Dorm",
    sellerName: "Alex Chen",
    sellerEmail: "alex.chen@university.edu",
    sellerPhone: "+1 (555) 234-5678"
  },
  {
    title: "Calculus: Early Transcendentals (8th Ed) - Stewart",
    description: "Standard text for MATH 21A/B/C. Very good condition with minor shelf wear on cover corners. Solved homework problems penciled lightly.",
    price: 35.0,
    category: "Books",
    condition: "Gently Used",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1532012164546-f432f2e372fe?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Engineering Hall Library",
    sellerName: "Marcus Vance",
    sellerEmail: "m.vance@university.edu",
    sellerPhone: "+1 (555) 345-6789"
  },
  {
    title: "Introduction to Algorithms (CLRS 3rd Ed)",
    description: "Looking to exchange for Bishop's Pattern Recognition & Machine Learning book, or sell. Pristine condition with dust jacket.",
    price: 0.0,
    category: "Books",
    condition: "Like New",
    type: "Exchange",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Computer Science Lab 3B",
    sellerName: "Sophia Patel",
    sellerEmail: "spatel@university.edu",
    sellerPhone: ""
  },
  {
    title: "TI-84 Plus CE Color Graphing Calculator",
    description: "Mint condition with slide case and USB mini charging cable. Battery holds charge for weeks. Essential for Calculus, Statistics, and Physics exams.",
    price: 65.0,
    category: "Electronics",
    condition: "Gently Used",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Engineering Center Lobby",
    sellerName: "David Miller",
    sellerEmail: "dmiller@university.edu",
    sellerPhone: "+1 (555) 456-7890"
  },
  {
    title: "Dell 24\" 1080p IPS Monitor (HDMI/VGA)",
    description: "Great second screen for laptop studying and homework. Anti-glare coating, 75Hz refresh rate. Comes with power adapter and 6ft HDMI cable.",
    price: 75.0,
    category: "Electronics",
    condition: "Like New",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"
    ],
    location: "South Tower Dorm Rm 304",
    sellerName: "Chloe Kim",
    sellerEmail: "ckim@university.edu",
    sellerPhone: "+1 (555) 567-8901"
  },
  {
    title: "Anker USB-C Power Bank 20,000mAh",
    description: "Brand new in box, received as an extra gift. Charges an iPhone up to 4.5 times or MacBook Air once. Dual USB-C and USB-A outputs.",
    price: 28.0,
    category: "Electronics",
    condition: "Brand New",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1609592424360-19349c25f4bb?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Student Union Lounge",
    sellerName: "Ethan Davis",
    sellerEmail: "edavis@university.edu",
    sellerPhone: ""
  },
  {
    title: "Ergonomic Breathable Mesh Desk Chair",
    description: "Super comfortable pneumatic height adjustment with lumbar support. Wheels roll smoothly. Fits dorm desks and study rooms perfectly.",
    price: 45.0,
    category: "Furniture",
    condition: "Gently Used",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1580481077195-c3a821a5060f?auto=format&fit=crop&w=800&q=80"
    ],
    location: "East Campus Apartments 4B",
    sellerName: "Jordan Reed",
    sellerEmail: "jreed@university.edu",
    sellerPhone: "+1 (555) 678-9012"
  },
  {
    title: "Compact 2-Door Dorm Mini-Fridge (3.2 cu ft)",
    description: "Separate top freezer compartment that actually freezes ice trays. Thoroughly defrosted, sanitized, and odor-free. Whisper-quiet compressor.",
    price: 80.0,
    category: "Furniture",
    condition: "Gently Used",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Freshman Quad (B Hall)",
    sellerName: "Emma Watson",
    sellerEmail: "ewatson@university.edu",
    sellerPhone: "+1 (555) 789-0123"
  },
  {
    title: "IKEA Standing LED Desk Lamp",
    description: "Graduating this semester and giving away my study lamp. Works great with 3 brightness modes. Free to any student who can pick it up today!",
    price: 0.0,
    category: "Furniture",
    condition: "Fair",
    type: "Free",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
    ],
    location: "West Tower Dorm Lobby",
    sellerName: "Liam Murphy",
    sellerEmail: "lmurphy@university.edu",
    sellerPhone: ""
  },
  {
    title: "Complete Architecture Drafting & Marker Kit",
    description: "Brand new unopened drafting set: 24\" T-square, aluminum architectural scale, mechanical lead holder with refills, and 12 grayscale markers.",
    price: 25.0,
    category: "Stationery",
    condition: "Brand New",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Design Studio Bldg",
    sellerName: "Maya Lin",
    sellerEmail: "mlin@university.edu",
    sellerPhone: "+1 (555) 890-1234"
  },
  {
    title: "Five Star Spiral College Ruled Notebooks (4 Pack)",
    description: "Bought bulk pack at beginning of year, don't need these 4. Free for anyone who needs clean notebooks for upcoming exams.",
    price: 0.0,
    category: "Stationery",
    condition: "Brand New",
    type: "Free",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Undergrad Library Front Desk",
    sellerName: "Noah Taylor",
    sellerEmail: "ntaylor@university.edu",
    sellerPhone: ""
  },
  {
    title: "Prismacolor Premier Soft Core Pencils (48-Color Set)",
    description: "Barely used for intro to drawing class. All 48 colored pencils sharpened only once. Comes in original tin box.",
    price: 30.0,
    category: "Stationery",
    condition: "Like New",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Fine Arts Center Rm 12",
    sellerName: "Olivia Brown",
    sellerEmail: "obrown@university.edu",
    sellerPhone: "+1 (555) 901-2345"
  },
  {
    title: "Single-Speed Campus Commuter Bicycle with U-Lock",
    description: "Reliable medium-frame road bike, perfect for getting between classes. Fresh tubes and brake pads installed last month. Includes Kryptonite lock.",
    price: 95.0,
    category: "Other",
    condition: "Gently Used",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80"
    ],
    location: "West Bike Racks / Rec Center",
    sellerName: "Sam Rivera",
    sellerEmail: "srivera@university.edu",
    sellerPhone: "+1 (555) 012-3456"
  },
  {
    title: "Adjustable Cast Iron Dumbbells (Pair, up to 25lbs)",
    description: "Dorm workout friendly. Includes threaded bars, spinlock collars, and weight plates (4x 2.5lb, 4x 5lb). Compact and sturdy.",
    price: 40.0,
    category: "Other",
    condition: "Like New",
    type: "Sale",
    status: "Available",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80"
    ],
    location: "Campus Recreation Center Entrance",
    sellerName: "Lucas Scott",
    sellerEmail: "lscott@university.edu",
    sellerPhone: "+1 (555) 123-4567"
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database:", mongoose.connection.name);

    const initialCount = await Listing.countDocuments();
    console.log(`Current listings count in database: ${initialCount}`);

    let insertedCount = 0;
    let existingCount = 0;

    for (const item of SAMPLE_LISTINGS) {
      // Check for existing listing by exact title to prevent duplicates
      const exists = await Listing.findOne({ title: item.title });
      if (exists) {
        existingCount++;
      } else {
        await Listing.create(item);
        insertedCount++;
      }
    }

    const finalCount = await Listing.countDocuments();

    console.log("\n================ SEED SUMMARY ================");
    console.log(`Listings in database before: ${initialCount}`);
    console.log(`Sample records inserted:     ${insertedCount}`);
    console.log(`Records already existed:     ${existingCount}`);
    console.log(`Listings in database after:  ${finalCount}`);
    console.log("==============================================\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Seed script completed.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seed();

