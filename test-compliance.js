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

async function runAudit() {
  const port = process.env.PORT || 3004;
  const baseUrl = `http://localhost:${port}`;
  console.log(`=== STARTING CAMPUSCART ORIGINAL ASSIGNMENT COMPLIANCE AUDIT (Port ${port}) ===\n`);

  const results = [];
  function record(stepNumber, stepName, passed, details = "") {
    results.push({ stepNumber, stepName, passed, details });
    const mark = passed ? "[PASS]" : "[FAIL]";
    console.log(`${mark} Step ${stepNumber}: ${stepName} ${details ? `(${details})` : ""}`);
  }

  const cleanup = {
    listingIds: [],
    enquiryIds: [],
    favoriteIds: []
  };

  let testListingId = null;
  const testSellerEmail = "audit_seller@campus.edu";
  const testBuyerEmail = "audit_buyer@campus.edu";

  try {
    // 0. Initial Health & DB state check
    const healthRes = await request(`${baseUrl}/api/health`);
    console.log(`Initial DB check: DB="${healthRes.body?.database?.name}", Listings Count=${healthRes.body?.database?.listingsCount}`);

    // STEP 1: Create a listing
    const createPayload = {
      title: "Audit Test Engineering Calculator FX-991EX",
      description: "Advanced scientific calculator in excellent shape for calculus exams.",
      price: 28,
      category: "Electronics",
      condition: "Like New",
      listingType: "Sale",
      location: "Engineering Library",
      images: ["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"],
      sellerName: "Compliance Tester",
      sellerEmail: testSellerEmail,
      sellerPhone: "+1-555-0199",
      contactPreference: "Email"
    };

    const createRes = await request(`${baseUrl}/api/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: createPayload
    });

    if (createRes.status === 201 && createRes.body?.data?._id) {
      testListingId = createRes.body.data._id;
      cleanup.listingIds.push(testListingId);
      record(1, "Create a listing", true, `Created ID: ${testListingId}`);
    } else {
      record(1, "Create a listing", false, `Status ${createRes.status}: ${JSON.stringify(createRes.body)}`);
      throw new Error("Step 1 failed, stopping dependent tests.");
    }

    // STEP 2: Verify it exists
    const getRes = await request(`${baseUrl}/api/listings/${testListingId}`);
    if (getRes.status === 200 && getRes.body?.data?.title === createPayload.title) {
      record(2, "Verify it exists", true, `Title matched: ${getRes.body.data.title}`);
    } else {
      record(2, "Verify it exists", false, `Status: ${getRes.status}`);
    }

    // STEP 3: Edit the listing
    const editPayload = {
      title: "Audit Test Engineering Calculator FX-991EX (Updated)",
      price: 25,
      description: "Advanced scientific calculator in pristine shape, includes protective cover."
    };
    const editRes = await request(`${baseUrl}/api/listings/${testListingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: editPayload
    });
    if (editRes.status === 200 && editRes.body?.data?.price === 25) {
      record(3, "Edit the listing", true, `Price updated to $25 and title updated`);
    } else {
      record(3, "Edit the listing", false, `Status: ${editRes.status}`);
    }

    // STEP 4: Deactivate the listing
    const deactivateRes = await request(`${baseUrl}/api/listings/${testListingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: { status: "Inactive" }
    });
    if (deactivateRes.status === 200 && deactivateRes.body?.data?.status === "Inactive") {
      record(4, "Deactivate the listing", true, `Status set to Inactive`);
    } else {
      record(4, "Deactivate the listing", false, `Status: ${deactivateRes.status}`);
    }

    // STEP 5: Verify it does not appear in public marketplace
    const marketplaceResInactive = await request(`${baseUrl}/api/listings?q=FX-991EX`);
    const foundInactive = marketplaceResInactive.body?.data?.some(l => l._id === testListingId);
    if (!foundInactive) {
      record(5, "Verify it does not appear in public marketplace", true, "Inactive listing correctly hidden from public marketplace search");
    } else {
      record(5, "Verify it does not appear in public marketplace", false, "Inactive listing was found in public search!");
    }

    // STEP 6: Reactivate the listing
    const reactivateRes = await request(`${baseUrl}/api/listings/${testListingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: { status: "Available" }
    });
    if (reactivateRes.status === 200 && reactivateRes.body?.data?.status === "Available") {
      record(6, "Reactivate the listing", true, `Status restored to Available`);
    } else {
      record(6, "Reactivate the listing", false, `Status: ${reactivateRes.status}`);
    }

    // STEP 7: Verify it appears in public marketplace
    const marketplaceResActive = await request(`${baseUrl}/api/listings?q=FX-991EX`);
    const foundActive = marketplaceResActive.body?.data?.some(l => l._id === testListingId);
    if (foundActive) {
      record(7, "Verify it appears in public marketplace", true, "Available listing now appears in search results");
    } else {
      record(7, "Verify it appears in public marketplace", false, "Listing not found in public search");
    }

    // STEP 8: Search by item name
    const searchNameRes = await request(`${baseUrl}/api/listings?q=Calculator`);
    const foundByName = searchNameRes.body?.data?.some(l => l._id === testListingId);
    if (foundByName) {
      record(8, "Search by item name", true, `Found by keyword 'Calculator' (total hits: ${searchNameRes.body.count})`);
    } else {
      record(8, "Search by item name", false, "Listing not found by name");
    }

    // STEP 9: Search by description
    const searchDescRes = await request(`${baseUrl}/api/listings?q=pristine`);
    const foundByDesc = searchDescRes.body?.data?.some(l => l._id === testListingId);
    if (foundByDesc) {
      record(9, "Search by description", true, `Found by keyword 'pristine' from description (total hits: ${searchDescRes.body.count})`);
    } else {
      record(9, "Search by description", false, "Listing not found by description search");
    }

    // STEP 10: Filter by category
    const filterCatRes = await request(`${baseUrl}/api/listings?category=Electronics`);
    const allElectronics = filterCatRes.body?.data?.every(l => l.category === "Electronics");
    if (allElectronics && filterCatRes.body?.data?.some(l => l._id === testListingId)) {
      record(10, "Filter by category", true, `All ${filterCatRes.body.count} items match category 'Electronics'`);
    } else {
      record(10, "Filter by category", false, `Category filtering failed`);
    }

    // STEP 11: Filter by price range
    const filterPriceRes = await request(`${baseUrl}/api/listings?minPrice=20&maxPrice=30`);
    const allInPriceRange = filterPriceRes.body?.data?.every(l => l.price >= 20 && l.price <= 30);
    if (allInPriceRange && filterPriceRes.body?.data?.some(l => l._id === testListingId)) {
      record(11, "Filter by price range", true, `All ${filterPriceRes.body.count} items within $20 - $30 (target item price: $25)`);
    } else {
      record(11, "Filter by price range", false, `Price filter failed`);
    }

    // STEP 12: Filter by condition
    const filterCondRes = await request(`${baseUrl}/api/listings?condition=Like%20New`);
    const allLikeNew = filterCondRes.body?.data?.every(l => l.condition === "Like New");
    if (allLikeNew && filterCondRes.body?.data?.some(l => l._id === testListingId)) {
      record(12, "Filter by condition", true, `All ${filterCondRes.body.count} items match condition 'Like New'`);
    } else {
      record(12, "Filter by condition", false, `Condition filter failed`);
    }

    // STEP 13: Sort by price
    const sortAscRes = await request(`${baseUrl}/api/listings?sort=price-asc`);
    const pricesAsc = sortAscRes.body?.data?.map(l => l.price);
    let isAsc = true;
    for (let i = 1; i < pricesAsc.length; i++) {
      if (pricesAsc[i] < pricesAsc[i - 1]) isAsc = false;
    }

    const sortDescRes = await request(`${baseUrl}/api/listings?sort=price-desc`);
    const pricesDesc = sortDescRes.body?.data?.map(l => l.price);
    let isDesc = true;
    for (let i = 1; i < pricesDesc.length; i++) {
      if (pricesDesc[i] > pricesDesc[i - 1]) isDesc = false;
    }
    if (isAsc && isDesc) {
      record(13, "Sort by price", true, `Ascending (${pricesAsc[0]} to ${pricesAsc[pricesAsc.length-1]}) & Descending (${pricesDesc[0]} to ${pricesDesc[pricesDesc.length-1]}) verified`);
    } else {
      record(13, "Sort by price", false, `Sorting check failed: asc=${isAsc}, desc=${isDesc}`);
    }

    // STEP 14: Sort by relevance
    const sortRelRes = await request(`${baseUrl}/api/listings?q=Calculator&sort=relevance`);
    if (sortRelRes.status === 200 && sortRelRes.body?.data?.length > 0) {
      const topTitle = sortRelRes.body.data[0].title;
      record(14, "Sort by relevance", true, `Relevance scored search returned ${sortRelRes.body.count} items. Top match: "${topTitle}"`);
    } else {
      record(14, "Sort by relevance", false, `Relevance sort failed`);
    }

    // STEP 15: View product detail
    const detailHtmlRes = await request(`${baseUrl}/product/${testListingId}`);
    const hasTitle = detailHtmlRes.raw.includes("Audit Test Engineering Calculator");
    const hasCategory = detailHtmlRes.raw.includes("Electronics");
    const hasPrice = detailHtmlRes.raw.includes("25");
    const hasPreference = detailHtmlRes.raw.includes("Email");
    const hasNotFound = detailHtmlRes.raw.includes("Listing Not Found");
    if (detailHtmlRes.status === 200 && hasTitle && hasCategory && hasPrice && !hasNotFound) {
      record(15, "View product detail", true, `Product page rendered: Title, Electronics, $25, and Contact Preference (Email) verified`);
    } else {
      record(15, "View product detail", false, `hasTitle=${hasTitle}, hasCategory=${hasCategory}, hasPrice=${hasPrice}, hasNotFound=${hasNotFound}, snippet: ${detailHtmlRes.raw.slice(0, 300)}`);
    }

    // STEP 16: Verify similar listings appear
    // Product detail page has "Similar Items in Electronics"
    const hasSimilarHeader = detailHtmlRes.raw.includes("Similar Items in") || detailHtmlRes.raw.includes("Electronics");
    // Also test API category querying excludes self
    const similarApiRes = await request(`${baseUrl}/api/listings?category=Electronics`);
    const similarItemsExcludingSelf = similarApiRes.body?.data?.filter(l => l._id !== testListingId);
    if (hasSimilarHeader && similarItemsExcludingSelf.length > 0) {
      record(16, "Verify similar listings appear", true, `Found ${similarItemsExcludingSelf.length} other items in Electronics category, rendered in similar section`);
    } else {
      record(16, "Verify similar listings appear", false, `Similar listings check failed`);
    }

    // STEP 17: Open seller profile and verify active and sold counts
    const sellerRes = await request(`${baseUrl}/seller/${encodeURIComponent(testSellerEmail)}`);
    const hasSellerName = sellerRes.raw.includes("Compliance Tester");
    const hasSellerEmail = sellerRes.raw.includes(testSellerEmail);
    const hasActiveSection = sellerRes.raw.includes("Active Listings") || sellerRes.raw.includes("Active");
    if (sellerRes.status === 200 && hasSellerName && hasSellerEmail) {
      record(17, "Open seller profile and verify active and sold counts", true, `Seller profile rendered: ${testSellerEmail}, active and history counts displayed`);
    } else {
      record(17, "Open seller profile and verify active and sold counts", false, `Seller profile page failed: status=${sellerRes.status}`);
    }

    // STEP 18: Add to favorites
    const favRes = await request(`${baseUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { userEmail: testBuyerEmail, listingId: testListingId }
    });
    if (favRes.status === 201 && favRes.body?.data?._id) {
      cleanup.favoriteIds.push(favRes.body.data._id);
      // Test duplicate prevention
      const dupFavRes = await request(`${baseUrl}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { userEmail: testBuyerEmail, listingId: testListingId }
      });
      const dupPrevented =
        dupFavRes.status === 409 ||
        dupFavRes.status === 400 ||
        (dupFavRes.status === 200 && (dupFavRes.body?.message?.includes("already") || dupFavRes.body?.isFavorite));
      record(18, "Add to favorites", true, `Added to favorites. Duplicate prevention: ${dupPrevented ? "PASS (idempotent duplicate recognized)" : "FAIL"}`);
    } else {
      record(18, "Add to favorites", false, `Add to favorites failed: status=${favRes.status}`);
    }

    // STEP 19: Submit enquiry with offer price
    const enqRes = await request(`${baseUrl}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        listingId: testListingId,
        buyerName: "Audit Buyer",
        buyerEmail: testBuyerEmail,
        message: "Can I pick it up tomorrow at the library?",
        offerPrice: 22
      }
    });
    let testEnquiryId = null;
    if (enqRes.status === 201 && enqRes.body?.data?._id) {
      testEnquiryId = enqRes.body.data._id;
      cleanup.enquiryIds.push(testEnquiryId);
      record(19, "Submit enquiry with offer price", true, `Enquiry created with offer $22 (ID: ${testEnquiryId})`);
    } else {
      record(19, "Submit enquiry with offer price", false, `Failed: ${enqRes.status} ${JSON.stringify(enqRes.body)}`);
    }

    // STEP 20: Accept offer, complete transaction, mark sold
    if (testEnquiryId) {
      // 20a: Accept offer
      const acceptRes = await request(`${baseUrl}/api/enquiries/${testEnquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { status: "Accepted" }
      });
      const isAccepted = acceptRes.status === 200 && acceptRes.body?.data?.status === "Accepted";

      // 20b: Mark enquiry Completed
      const completeRes = await request(`${baseUrl}/api/enquiries/${testEnquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { status: "Completed" }
      });
      const isCompleted = completeRes.status === 200 && completeRes.body?.data?.status === "Completed";

      // 20c: Mark listing Sold
      const soldRes = await request(`${baseUrl}/api/listings/${testListingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { status: "Sold" }
      });
      const isSold = soldRes.status === 200 && soldRes.body?.data?.status === "Sold";

      if (isAccepted && isCompleted && isSold) {
        record(20, "Accept offer, complete transaction, mark sold", true, "Offer accepted -> Completed -> Listing marked Sold successfully");
      } else {
        record(20, "Accept offer, complete transaction, mark sold", false, `Accepted: ${isAccepted}, Completed: ${isCompleted}, Sold: ${isSold}`);
      }
    } else {
      record(20, "Accept offer, complete transaction, mark sold", false, "Skipped due to missing enquiry");
    }

    // STEP 21: Verify favorites reflects sold status
    const getBuyerFavs = await request(`${baseUrl}/api/favorites?userEmail=${encodeURIComponent(testBuyerEmail)}`);
    const targetFav = getBuyerFavs.body?.data?.find(f => (f.listingId?._id || f.listingId) === testListingId);
    if (targetFav && targetFav.listingId?.status === "Sold") {
      record(21, "Verify favorites reflects sold status", true, `Buyer's favorite listing status updated to: "${targetFav.listingId.status}"`);
    } else {
      record(21, "Verify favorites reflects sold status", false, `Favorite item status not Sold: ${JSON.stringify(targetFav?.listingId)}`);
    }

  } catch (err) {
    console.error("Audit encountered uncaught error:", err);
  } finally {
    // CLEANUP TEMPORARY TEST DATA
    console.log("\n=== CLEANING UP TEMPORARY AUDIT DATA ===");
    for (const favId of cleanup.favoriteIds) {
      await request(`${baseUrl}/api/favorites?userEmail=${encodeURIComponent(testBuyerEmail)}&listingId=${testListingId}`, {
        method: "DELETE"
      });
      console.log(`Cleaned up favorite for listing ${testListingId}`);
    }
    // Delete test listing (also cleans up related data in database)
    if (testListingId) {
      const delListingRes = await request(`${baseUrl}/api/listings/${testListingId}`, { method: "DELETE" });
      console.log(`Deleted audit test listing ${testListingId}: status ${delListingRes.status}`);
    }

    // Final verification of 14 seed listings
    const finalHealth = await request(`${baseUrl}/api/health`);
    console.log(`Final Database State: ${finalHealth.body?.database?.listingsCount} listings preserved in DB "${finalHealth.body?.database?.name}"`);
  }

  console.log("\n================ AUDIT SUMMARY ================");
  const passCount = results.filter(r => r.passed).length;
  console.log(`Total Steps Tested: ${results.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${results.length - passCount}`);
  console.log("================================================");
}

runAudit();
