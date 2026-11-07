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
  console.log("=== STARTING CAMPUSCART PHASE 2 COMPREHENSIVE TESTS ===");

  const results = [];

  // 1. Health check & MongoDB audit
  try {
    const res = await request(`${baseUrl}/api/health`);
    console.log("1. /api/health Status:", res.status);
    console.log("   Body:", JSON.stringify(res.body));
    if (res.status === 200 && res.body?.database?.connected && res.body?.database?.ping === "success") {
      results.push({ test: "MongoDB Connection & Ping", passed: true, details: `DB: ${res.body.database.name}, Count: ${res.body.database.listingsCount}` });
    } else {
      results.push({ test: "MongoDB Connection & Ping", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "MongoDB Connection & Ping", passed: false, error: err.message });
  }

  // 2. GET all listings
  let firstListingId = null;
  try {
    const res = await request(`${baseUrl}/api/listings`);
    console.log("2. GET /api/listings:", res.status, "Count:", res.body?.count);
    if (res.status === 200 && res.body?.success && res.body.data.length >= 14) {
      firstListingId = res.body.data[0]._id;
      results.push({ test: "GET all listings", passed: true, details: `Returned ${res.body.count} listings` });
    } else {
      results.push({ test: "GET all listings", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "GET all listings", passed: false, error: err.message });
  }

  // 3. Search listings
  try {
    const res = await request(`${baseUrl}/api/listings?q=Biology`);
    console.log("3. GET /api/listings?q=Biology:", res.status, "Found:", res.body?.count);
    if (res.status === 200 && res.body?.count > 0 && res.body.data[0].title.includes("Biology")) {
      results.push({ test: "Search by keyword", passed: true, details: `Found: "${res.body.data[0].title}"` });
    } else {
      results.push({ test: "Search by keyword", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Search by keyword", passed: false, error: err.message });
  }

  // 4. Filter by Category
  try {
    const res = await request(`${baseUrl}/api/listings?category=Electronics`);
    console.log("4. GET /api/listings?category=Electronics:", res.status, "Count:", res.body?.count);
    const allMatch = res.body?.data?.every(i => i.category === "Electronics");
    if (res.status === 200 && allMatch && res.body.count > 0) {
      results.push({ test: "Category filter (Electronics)", passed: true, details: `Found ${res.body.count} items` });
    } else {
      results.push({ test: "Category filter (Electronics)", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Category filter (Electronics)", passed: false, error: err.message });
  }

  // 5. Filter by Condition
  try {
    const res = await request(`${baseUrl}/api/listings?condition=Brand%20New`);
    console.log("5. GET /api/listings?condition=Brand New:", res.status, "Count:", res.body?.count);
    const allMatch = res.body?.data?.every(i => i.condition === "Brand New");
    if (res.status === 200 && allMatch && res.body.count > 0) {
      results.push({ test: "Condition filter (Brand New)", passed: true, details: `Found ${res.body.count} items` });
    } else {
      results.push({ test: "Condition filter (Brand New)", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Condition filter (Brand New)", passed: false, error: err.message });
  }

  // 6. Filter by Type
  try {
    const res = await request(`${baseUrl}/api/listings?type=Free`);
    console.log("6. GET /api/listings?type=Free:", res.status, "Count:", res.body?.count);
    const allMatch = res.body?.data?.every(i => i.type === "Free" && i.price === 0);
    if (res.status === 200 && allMatch && res.body.count > 0) {
      results.push({ test: "Type filter (Free)", passed: true, details: `Found ${res.body.count} free items with price 0` });
    } else {
      results.push({ test: "Type filter (Free)", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Type filter (Free)", passed: false, error: err.message });
  }

  // 7. Sort by Price Low to High
  try {
    const res = await request(`${baseUrl}/api/listings?sort=price-low`);
    console.log("7. GET /api/listings?sort=price-low:", res.status);
    const isSorted = res.body?.data?.every((val, i, arr) => i === 0 || arr[i - 1].price <= val.price);
    if (res.status === 200 && isSorted) {
      results.push({ test: "Sort price low to high", passed: true, details: `Lowest: $${res.body.data[0].price}, Highest: $${res.body.data[res.body.data.length - 1].price}` });
    } else {
      results.push({ test: "Sort price low to high", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "Sort price low to high", passed: false, error: err.message });
  }

  // 8. POST temporary test listing
  let testListingId = null;
  try {
    const postPayload = {
      title: "TEMPORARY_TEST_LISTING_PHASE2",
      description: "Automated verification test listing for Phase 2 validation",
      price: 18.5,
      category: "Stationery",
      condition: "Like New",
      type: "Sale",
      location: "Engineering Hall Room 102",
      sellerName: "Test Student",
      sellerEmail: "test.student@university.edu",
      sellerPhone: "+1 (555) 999-0000",
      image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
    };

    const res = await request(`${baseUrl}/api/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });

    console.log("8. POST /api/listings:", res.status, "Created ID:", res.body?.data?._id);
    if (res.status === 201 && res.body?.success && res.body?.data?._id) {
      testListingId = res.body.data._id;
      results.push({ test: "POST create listing", passed: true, details: `Created ID: ${testListingId}` });
    } else {
      results.push({ test: "POST create listing", passed: false, error: res.body });
    }
  } catch (err) {
    results.push({ test: "POST create listing", passed: false, error: err.message });
  }

  // 9. GET created listing by ID
  try {
    if (testListingId) {
      const res = await request(`${baseUrl}/api/listings/${testListingId}`);
      console.log("9. GET /api/listings/[id]:", res.status, "Title:", res.body?.data?.title);
      if (res.status === 200 && res.body?.data?.title === "TEMPORARY_TEST_LISTING_PHASE2") {
        results.push({ test: "GET listing by ID", passed: true, details: `Verified item: ${res.body.data.title}` });
      } else {
        results.push({ test: "GET listing by ID", passed: false, error: res.body });
      }
    }
  } catch (err) {
    results.push({ test: "GET listing by ID", passed: false, error: err.message });
  }

  // 10. PATCH created listing
  try {
    if (testListingId) {
      const patchPayload = {
        status: "Reserved",
        price: 15.0,
      };

      const res = await request(`${baseUrl}/api/listings/${testListingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchPayload),
      });

      console.log("10. PATCH /api/listings/[id]:", res.status, "Updated status:", res.body?.data?.status);
      if (res.status === 200 && res.body?.data?.status === "Reserved" && res.body?.data?.price === 15.0) {
        results.push({ test: "PATCH update listing", passed: true, details: `Status: ${res.body.data.status}, Price: $${res.body.data.price}` });
      } else {
        results.push({ test: "PATCH update listing", passed: false, error: res.body });
      }
    }
  } catch (err) {
    results.push({ test: "PATCH update listing", passed: false, error: err.message });
  }

  // 11. DELETE created test listing
  try {
    if (testListingId) {
      const res = await request(`${baseUrl}/api/listings/${testListingId}`, {
        method: "DELETE",
      });

      console.log("11. DELETE /api/listings/[id]:", res.status, "Message:", res.body?.message);
      if (res.status === 200 && res.body?.success) {
        results.push({ test: "DELETE test listing", passed: true, details: `Successfully cleaned up test record ${testListingId}` });
      } else {
        results.push({ test: "DELETE test listing", passed: false, error: res.body });
      }

      // Verify 404 on subsequent GET
      const getAgain = await request(`${baseUrl}/api/listings/${testListingId}`);
      if (getAgain.status === 404) {
        results.push({ test: "Verify deletion (404 on GET)", passed: true, details: "Confirmed record no longer exists" });
      } else {
        results.push({ test: "Verify deletion (404 on GET)", passed: false, error: `Expected 404, got ${getAgain.status}` });
      }
    }
  } catch (err) {
    results.push({ test: "DELETE test listing", passed: false, error: err.message });
  }

  // 12. UI Pages HTTP tests
  try {
    const homeRes = await request(`${baseUrl}/`);
    const homePass = homeRes.status === 200 && homeRes.raw.includes("Latest Campus Listings");
    results.push({ test: "Homepage UI (Live MongoDB listings)", passed: homePass, details: `HTTP ${homeRes.status}` });

    const marketRes = await request(`${baseUrl}/marketplace`);
    const marketPass = marketRes.status === 200 && marketRes.raw.includes("Campus Marketplace");
    results.push({ test: "Marketplace UI", passed: marketPass, details: `HTTP ${marketRes.status}` });

    const sellRes = await request(`${baseUrl}/sell`);
    const sellPass = sellRes.status === 200 && sellRes.raw.includes("List an Item");
    results.push({ test: "Sell Item Form UI", passed: sellPass, details: `HTTP ${sellRes.status}` });

    if (firstListingId) {
      const prodRes = await request(`${baseUrl}/product/${firstListingId}`);
      const prodPass = prodRes.status === 200 && prodRes.raw.includes("Pickup Location");
      results.push({ test: "Product Details Page UI (Real DB ID)", passed: prodPass, details: `HTTP ${prodRes.status}` });
    }

    const invalidRes = await request(`${baseUrl}/product/invalid-id-9999`);
    const invalidPass = invalidRes.status === 200 && invalidRes.raw.includes("Listing Not Found");
    results.push({ test: "Invalid Product ID Not-Found UI", passed: invalidPass, details: `Handled with 404/not-found UI` });
  } catch (err) {
    results.push({ test: "UI Pages HTTP Tests", passed: false, error: err.message });
  }

  console.log("\n================ TEST SUMMARY REPORT ================");
  let passedCount = 0;
  for (const r of results) {
    if (r.passed) {
      passedCount++;
      console.log(`[PASS] ${r.test}: ${r.details || "OK"}`);
    } else {
      console.log(`[FAIL] ${r.test}: ${r.error || "Failed"}`);
    }
  }
  console.log(`\nTOTAL: ${passedCount}/${results.length} tests passed.`);
  console.log("====================================================\n");

  process.exit(passedCount === results.length ? 0 : 1);
}

runTests();

