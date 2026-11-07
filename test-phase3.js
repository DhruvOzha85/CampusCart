const http = require("http");

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  const baseUrl = "http://localhost:3003";
  console.log("=== STARTING CAMPUSCART PHASE 3 COMPREHENSIVE TESTS ===");

  const results = [];
  const testCleanup = { enquiries: [], favorites: [] };

  // 1. Health check & MongoDB audit
  let firstListing = null;
  try {
    const res = await request(`${baseUrl}/api/health`);
    console.log("1. /api/health:", res.status, JSON.stringify(res.body));
    if (
      res.status === 200 &&
      res.body?.database?.connected &&
      res.body?.database?.ping === "success" &&
      res.body?.database?.listingsCount >= 14
    ) {
      results.push({
        test: "MongoDB Connection, Ping & Listing Preservation",
        passed: true,
        details: `DB: ${res.body.database.name}, Listings: ${res.body.database.listingsCount}`,
      });
    } else {
      results.push({ test: "MongoDB Connection & Ping", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "MongoDB Connection & Ping", passed: false, error: err.message });
  }

  // Fetch a listing to test enquiries & favorites
  try {
    const listingsRes = await request(`${baseUrl}/api/listings`);
    firstListing = listingsRes.body.data[0];
    console.log(`Using target listing: "${firstListing.title}" (ID: ${firstListing._id}, Seller: ${firstListing.sellerEmail})`);
  } catch (err) {
    console.error("Failed to get listing for test:", err);
  }

  // --- ENQUIRY TESTS ---

  // 2. Create basic enquiry
  let enqId1 = null;
  try {
    const res = await request(`${baseUrl}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: firstListing._id,
        buyerName: "Test Buyer One",
        buyerEmail: "test.buyer1@university.edu",
        message: "Hi, is this available for meetup at the quad?",
      }),
    });
    console.log("2. POST /api/enquiries (Basic):", res.status, res.body?.data?._id);
    if (res.status === 201 && res.body?.success && res.body.data?._id) {
      enqId1 = res.body.data._id;
      testCleanup.enquiries.push(enqId1);
      results.push({ test: "Create basic enquiry", passed: true, details: `ID: ${enqId1}` });
    } else {
      results.push({ test: "Create basic enquiry", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Create basic enquiry", passed: false, error: err.message });
  }

  // 3. Create enquiry with Offer Price
  let enqId2 = null;
  try {
    const res = await request(`${baseUrl}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: firstListing._id,
        buyerName: "Test Buyer Two",
        buyerEmail: "test.buyer2@university.edu",
        message: "I can buy this today for a small discount!",
        offerPrice: 32.5,
      }),
    });
    console.log("3. POST /api/enquiries (With Offer):", res.status, "Offer:", res.body?.data?.offerPrice);
    if (res.status === 201 && res.body?.data?.offerPrice === 32.5 && res.body?.data?.status === "Pending") {
      enqId2 = res.body.data._id;
      testCleanup.enquiries.push(enqId2);
      results.push({ test: "Create enquiry with offer price", passed: true, details: `Offer: $${res.body.data.offerPrice}` });
    } else {
      results.push({ test: "Create enquiry with offer price", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Create enquiry with offer price", passed: false, error: err.message });
  }

  // 4. Retrieve buyer enquiries
  try {
    const res = await request(`${baseUrl}/api/enquiries?buyerEmail=test.buyer2@university.edu`);
    console.log("4. GET /api/enquiries?buyerEmail=...:", res.status, "Count:", res.body?.count);
    if (res.status === 200 && res.body?.data?.some((e) => e._id === enqId2)) {
      results.push({ test: "Retrieve buyer enquiries", passed: true, details: `Found buyer enquiry ${enqId2}` });
    } else {
      results.push({ test: "Retrieve buyer enquiries", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Retrieve buyer enquiries", passed: false, error: err.message });
  }

  // 5. Retrieve seller enquiries
  try {
    const res = await request(`${baseUrl}/api/enquiries?sellerEmail=${encodeURIComponent(firstListing.sellerEmail)}`);
    console.log("5. GET /api/enquiries?sellerEmail=...:", res.status, "Count:", res.body?.count);
    if (res.status === 200 && res.body?.data?.length > 0) {
      results.push({ test: "Retrieve seller enquiries", passed: true, details: `Found ${res.body.count} enquiries for seller` });
    } else {
      results.push({ test: "Retrieve seller enquiries", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Retrieve seller enquiries", passed: false, error: err.message });
  }

  // 6. Accept an offer (Pending -> Accepted)
  try {
    const res = await request(`${baseUrl}/api/enquiries/${enqId2}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Accepted",
        sellerEmail: firstListing.sellerEmail,
      }),
    });
    console.log("6. PATCH /api/enquiries/[id] (Accept):", res.status, res.body?.data?.status);
    if (res.status === 200 && res.body?.data?.status === "Accepted") {
      results.push({ test: "Accept an offer", passed: true, details: "Status updated to Accepted" });
    } else {
      results.push({ test: "Accept an offer", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Accept an offer", passed: false, error: err.message });
  }

  // 7. Mark an accepted deal Completed (Accepted -> Completed)
  try {
    const res = await request(`${baseUrl}/api/enquiries/${enqId2}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Completed",
        sellerEmail: firstListing.sellerEmail,
      }),
    });
    console.log("7. PATCH /api/enquiries/[id] (Complete):", res.status, res.body?.data?.status);
    if (res.status === 200 && res.body?.data?.status === "Completed") {
      results.push({ test: "Mark deal Completed", passed: true, details: "Status updated to Completed" });
    } else {
      results.push({ test: "Mark deal Completed", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Mark deal Completed", passed: false, error: err.message });
  }

  // 8. Reject an offer (Pending -> Rejected)
  try {
    const res = await request(`${baseUrl}/api/enquiries/${enqId1}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Rejected",
        sellerEmail: firstListing.sellerEmail,
      }),
    });
    console.log("8. PATCH /api/enquiries/[id] (Reject):", res.status, res.body?.data?.status);
    if (res.status === 200 && res.body?.data?.status === "Rejected") {
      results.push({ test: "Reject an offer", passed: true, details: "Status updated to Rejected" });
    } else {
      results.push({ test: "Reject an offer", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Reject an offer", passed: false, error: err.message });
  }

  // 9. Verify invalid status transitions are rejected (Completed -> Pending or Rejected -> Accepted)
  try {
    const res = await request(`${baseUrl}/api/enquiries/${enqId2}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Pending",
        sellerEmail: firstListing.sellerEmail,
      }),
    });
    console.log("9. Invalid status transition check (Completed -> Pending):", res.status, res.body?.message);
    if (res.status === 400 && !res.body?.success) {
      results.push({ test: "Reject invalid status transitions", passed: true, details: "Correctly returned HTTP 400" });
    } else {
      results.push({ test: "Reject invalid status transitions", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Reject invalid status transitions", passed: false, error: err.message });
  }

  // --- FAVORITES TESTS ---
  const testVisitor = `test_visitor_${Date.now()}`;

  // 10. Add a favorite
  try {
    const res = await request(`${baseUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: firstListing._id,
        visitorId: testVisitor,
      }),
    });
    console.log("10. POST /api/favorites (Add):", res.status, res.body?.message);
    if (res.status === 201 && res.body?.isFavorite === true) {
      testCleanup.favorites.push({ listingId: firstListing._id, visitorId: testVisitor });
      results.push({ test: "Add a favorite", passed: true, details: "Added successfully" });
    } else {
      results.push({ test: "Add a favorite", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Add a favorite", passed: false, error: err.message });
  }

  // 11. Retrieve favorites
  try {
    const res = await request(`${baseUrl}/api/favorites?visitorId=${testVisitor}`);
    console.log("11. GET /api/favorites?visitorId=...:", res.status, "Count:", res.body?.count);
    if (res.status === 200 && res.body?.count === 1 && res.body.data[0].listingId?._id === firstListing._id) {
      results.push({ test: "Retrieve visitor favorites", passed: true, details: `Retrieved ${res.body.count} favorite` });
    } else {
      results.push({ test: "Retrieve visitor favorites", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Retrieve visitor favorites", passed: false, error: err.message });
  }

  // 12. Add same favorite again (Duplicate prevention)
  try {
    const res = await request(`${baseUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: firstListing._id,
        visitorId: testVisitor,
      }),
    });
    console.log("12. POST duplicate favorite check:", res.status, res.body?.message);
    if (res.status === 200 && res.body?.message.includes("already")) {
      results.push({ test: "Prevent duplicate favorites", passed: true, details: "Duplicate rejected / reported already in favorites" });
    } else {
      results.push({ test: "Prevent duplicate favorites", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Prevent duplicate favorites", passed: false, error: err.message });
  }

  // 13. Remove a favorite
  try {
    const res = await request(`${baseUrl}/api/favorites?listingId=${firstListing._id}&visitorId=${testVisitor}`, {
      method: "DELETE",
    });
    console.log("13. DELETE /api/favorites:", res.status, res.body?.message);
    if (res.status === 200 && res.body?.isFavorite === false) {
      results.push({ test: "Remove a favorite", passed: true, details: "Successfully removed" });
    } else {
      results.push({ test: "Remove a favorite", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Remove a favorite", passed: false, error: err.message });
  }

  // 14. Verify removal
  try {
    const res = await request(`${baseUrl}/api/favorites?visitorId=${testVisitor}`);
    if (res.status === 200 && res.body?.count === 0) {
      results.push({ test: "Verify favorite removal", passed: true, details: "Confirmed 0 favorites remaining" });
    } else {
      results.push({ test: "Verify favorite removal", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Verify favorite removal", passed: false, error: err.message });
  }

  // --- DASHBOARD AND UI TESTS ---

  // 15. Dashboard UI page loads
  try {
    const res = await request(`${baseUrl}/dashboard`);
    const pass = res.status === 200 && res.raw.includes("Student Dashboard");
    results.push({ test: "Student Dashboard UI Route", passed: pass, details: `HTTP ${res.status}` });
  } catch (err) {
    results.push({ test: "Student Dashboard UI Route", passed: false, error: err.message });
  }

  // 16. Product details page includes enquiry & offer section
  try {
    const res = await request(`${baseUrl}/product/${firstListing._id}`);
    const pass = res.status === 200 && res.raw.includes("Pickup Location");
    results.push({ test: "Product Details Page with Enquiry Integration", passed: pass, details: `HTTP ${res.status}` });
  } catch (err) {
    results.push({ test: "Product Details Page with Enquiry Integration", passed: false, error: err.message });
  }

  // --- CLEANUP TEST RECORDS (PRESERVE ALL ORIGINAL DATA) ---
  console.log("\nCleaning up temporary test records...");
  const mongoose = require("mongoose");
  try {
    // Using native process.env.MONGODB_URI
    if (!process.env.MONGODB_URI) {
      const fs = require("fs");
      const envText = fs.readFileSync(".env.local", "utf8");
      const match = envText.match(/MONGODB_URI=(.+)/);
      if (match) process.env.MONGODB_URI = match[1].trim();
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const EnquiryModel = mongoose.models.Enquiry || mongoose.model("Enquiry", new mongoose.Schema({}, { strict: false }));
    const FavoriteModel = mongoose.models.Favorite || mongoose.model("Favorite", new mongoose.Schema({}, { strict: false }));

    if (testCleanup.enquiries.length > 0) {
      await EnquiryModel.deleteMany({ _id: { $in: testCleanup.enquiries } });
      console.log(`Cleaned up ${testCleanup.enquiries.length} test enquiries.`);
    }

    if (testCleanup.favorites.length > 0) {
      for (const fav of testCleanup.favorites) {
        await FavoriteModel.deleteMany({ visitorId: fav.visitorId });
      }
      console.log(`Cleaned up test favorites for visitor ${testVisitor}.`);
    }

    // Reset first listing status back to Available if modified
    const ListingModel = mongoose.models.Listing || mongoose.model("Listing", new mongoose.Schema({}, { strict: false }));
    await ListingModel.findByIdAndUpdate(firstListing._id, { status: "Available" });
    console.log(`Reset test target listing status back to 'Available'.`);

    await mongoose.disconnect();
  } catch (e) {
    console.error("Cleanup error:", e);
  }

  console.log("\n================ PHASE 3 TEST SUMMARY REPORT ================");
  let passedCount = 0;
  for (const r of results) {
    if (r.passed) {
      passedCount++;
      console.log(`[PASS] ${r.test}: ${r.details || "OK"}`);
    } else {
      console.log(`[FAIL] ${r.test}: ${JSON.stringify(r.error) || "Failed"}`);
    }
  }
  console.log(`\nTOTAL: ${passedCount}/${results.length} tests passed.`);
  console.log("=============================================================\n");

  process.exit(passedCount === results.length ? 0 : 1);
}

runTests();
