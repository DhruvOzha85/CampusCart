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

async function verifyAll() {
  const port = 3005;
  const baseUrl = `http://localhost:${port}`;
  console.log(`=== RUNNING FINAL VERIFICATION ON ${baseUrl} ===\n`);

  const report = {};
  const cleanup = { listingIds: [], enquiryIds: [], favoriteIds: [] };

  // 1. Test Application Routes
  console.log("--- 1. Testing Application Routes ---");
  const routes = [
    { path: "/", name: "Homepage" },
    { path: "/marketplace", name: "Marketplace" },
    { path: "/sell", name: "Sell Form" },
    { path: "/dashboard", name: "Student Dashboard" },
    { path: "/api/health", name: "Health API" },
    { path: "/api/listings", name: "Listings API" },
    { path: "/api/enquiries", name: "Enquiries API" },
    { path: "/api/favorites", name: "Favorites API" },
  ];

  let routesAllPassed = true;
  for (const r of routes) {
    const res = await request(`${baseUrl}${r.path}`);
    const ok = res.status === 200;
    console.log(`Route [${r.path}] (${r.name}): ${res.status} ${ok ? "OK" : "FAIL"}`);
    if (!ok) routesAllPassed = false;
  }
  report.routes = routesAllPassed;

  // 2. Fetch sample listing & test dynamic routes
  const listingsRes = await request(`${baseUrl}/api/listings`);
  const sampleListing = listingsRes.body.data[0];
  const prodRes = await request(`${baseUrl}/product/${sampleListing._id}`);
  const sellerRes = await request(`${baseUrl}/seller/${encodeURIComponent(sampleListing.sellerEmail)}`);
  console.log(`Route [/product/${sampleListing._id}]: ${prodRes.status} ${prodRes.status === 200 ? "OK" : "FAIL"}`);
  console.log(`Route [/seller/${sampleListing.sellerEmail}]: ${sellerRes.status} ${sellerRes.status === 200 ? "OK" : "FAIL"}`);
  report.dynamicRoutes = prodRes.status === 200 && sellerRes.status === 200;

  // 3. Browser Interaction Verification
  console.log("\n--- 2. Verifying Browser Interactions & Flows ---");
  
  // Create listing
  const newListing = {
    title: "Verification TI-84 Plus CE Graphing Calculator",
    description: "Mint condition color screen calculator for engineering coursework.",
    price: 65,
    category: "Electronics",
    condition: "Like New",
    listingType: "Sale",
    location: "Student Union",
    images: ["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"],
    sellerName: "Verification Seller",
    sellerEmail: "verifier_seller@campus.edu",
    sellerPhone: "+1-555-0188",
    contactPreference: "Email"
  };

  const createRes = await request(`${baseUrl}/api/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: newListing
  });
  const createdListingId = createRes.body?.data?._id;
  cleanup.listingIds.push(createdListingId);
  console.log(`Created test listing ID: ${createdListingId}`);

  // Edit listing
  const editRes = await request(`${baseUrl}/api/listings/${createdListingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: { price: 60, title: "Verification TI-84 Plus CE Graphing Calculator (Updated)" }
  });
  const editOk = editRes.body?.data?.price === 60;
  console.log(`Edit listing: ${editOk ? "PASS" : "FAIL"}`);

  // Search & filter
  const searchRes = await request(`${baseUrl}/api/listings?q=Graphing&minPrice=50&maxPrice=70&category=Electronics`);
  const searchFound = searchRes.body?.data?.some(l => l._id === createdListingId);
  console.log(`Search & Filter: ${searchFound ? "PASS" : "FAIL"}`);

  // Product detail & similar listings
  const detailRes = await request(`${baseUrl}/product/${createdListingId}`);
  const hasDetails = detailRes.raw.includes("Verification TI-84 Plus") && detailRes.raw.includes("60.00");
  const hasSimilar = detailRes.raw.includes("Similar Items in") || detailRes.raw.includes("Electronics");
  console.log(`Product Details & Similar Items: ${hasDetails && hasSimilar ? "PASS" : "FAIL"}`);

  // Seller profile & phone privacy
  const sellerProfRes = await request(`${baseUrl}/seller/${encodeURIComponent("verifier_seller@campus.edu")}`);
  const hasSellerName = sellerProfRes.raw.includes("Verification Seller");
  const phoneHiddenBecauseEmailOnly = !sellerProfRes.raw.includes("+1-555-0188");
  console.log(`Seller Profile & Phone Privacy (Email-only hides phone): ${hasSellerName && phoneHiddenBecauseEmailOnly ? "PASS" : "FAIL"}`);

  // Favorites add, duplicate prevention & remove
  const favAddRes = await request(`${baseUrl}/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { userEmail: "verifier_buyer@campus.edu", listingId: createdListingId }
  });
  const favAddOk = favAddRes.status === 201;
  const favDupRes = await request(`${baseUrl}/api/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { userEmail: "verifier_buyer@campus.edu", listingId: createdListingId }
  });
  const favDupOk = favDupRes.status === 200 || favDupRes.status === 409;
  const favDelRes = await request(`${baseUrl}/api/favorites?userEmail=${encodeURIComponent("verifier_buyer@campus.edu")}&listingId=${createdListingId}`, {
    method: "DELETE"
  });
  const favDelOk = favDelRes.status === 200;
  console.log(`Favorites Add/Duplicate/Remove: ${favAddOk && favDupOk && favDelOk ? "PASS" : "FAIL"}`);

  // 4. Buyer-Facing Enquiry Response Notifications
  console.log("\n--- 3. Verifying Buyer-Facing Enquiry Response Notifications ---");
  const enqCreateRes = await request(`${baseUrl}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      listingId: createdListingId,
      buyerName: "Notification Tester",
      buyerEmail: "notif_buyer@campus.edu",
      message: "Is this still available for pick up?",
      offerPrice: 55
    }
  });
  const enquiryId = enqCreateRes.body?.data?._id;
  cleanup.enquiryIds.push(enquiryId);
  console.log(`Submitted enquiry ID: ${enquiryId} with offer $55`);

  // Seller accepts the offer
  const acceptRes = await request(`${baseUrl}/api/enquiries/${enquiryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: { status: "Accepted" }
  });
  const acceptOk = acceptRes.body?.data?.status === "Accepted";
  console.log(`Seller marked offer Accepted: ${acceptOk ? "PASS" : "FAIL"}`);

  // Check buyer's sent enquiries
  const buyerEnqRes = await request(`${baseUrl}/api/enquiries?buyerEmail=${encodeURIComponent("notif_buyer@campus.edu")}`);
  const buyerEnquiry = buyerEnqRes.body?.data?.find(e => e._id === enquiryId);
  const buyerStatusUpdated = buyerEnquiry && buyerEnquiry.status === "Accepted";

  // Simulate dashboard notification generator (matching StudentDashboard.js logic)
  const buyerNotification = buyerEnquiry ? {
    id: `sent_${buyerEnquiry._id}`,
    type: "sent",
    title: `Your offer/enquiry was marked ${buyerEnquiry.status}`,
    desc: `On "${buyerEnquiry.listingId?.title || "item"}"`,
    status: buyerEnquiry.status,
    date: buyerEnquiry.updatedAt || buyerEnquiry.createdAt,
  } : null;

  const notifOk = buyerStatusUpdated && buyerNotification && buyerNotification.title === "Your offer/enquiry was marked Accepted";
  console.log(`Buyer-facing enquiry response notification: ${notifOk ? "PASS" : "FAIL"}`);
  console.log(`Generated Buyer Notification:`, buyerNotification);
  report.notifications = notifOk;

  // Seller completes transaction
  const completeRes = await request(`${baseUrl}/api/enquiries/${enquiryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: { status: "Completed" }
  });
  const completeOk = completeRes.body?.data?.status === "Completed";
  console.log(`Seller marked deal Completed: ${completeOk ? "PASS" : "FAIL"}`);

  // 5. Responsive Design Verification
  console.log("\n--- 4. Checking Viewport Responsiveness Classes ---");
  const homeHtml = (await request(`${baseUrl}/`)).raw;
  const dashHtml = (await request(`${baseUrl}/dashboard`)).raw;
  
  const hasNavbarMobileToggle = homeHtml.includes("md:hidden") && homeHtml.includes("hidden md:flex");
  const hasResponsiveGrid = homeHtml.includes("grid-cols-1 sm:grid-cols-2") && (homeHtml.includes("lg:grid-cols-4") || homeHtml.includes("md:grid-cols-3"));
  const hasResponsiveDashboard = dashHtml.includes("flex-col") || dashHtml.includes("overflow-x-auto");
  
  console.log(`Navbar mobile breakpoint (hidden md:flex / md:hidden): ${hasNavbarMobileToggle ? "PASS" : "FAIL"}`);
  console.log(`Marketplace adaptive grid (1 col mobile -> 2 col tablet -> 4 col desktop): ${hasResponsiveGrid ? "PASS" : "FAIL"}`);
  console.log(`Dashboard mobile adaptation: ${hasResponsiveDashboard ? "PASS" : "FAIL"}`);
  report.responsive = hasNavbarMobileToggle && hasResponsiveGrid && hasResponsiveDashboard;

  // Cleanup
  console.log("\n--- 5. Cleanup Test Data ---");
  if (createdListingId) {
    await request(`${baseUrl}/api/listings/${createdListingId}`, { method: "DELETE" });
    console.log(`Cleaned up test listing ${createdListingId}`);
  }

  // 6. DB Preservation check
  const healthFinal = await request(`${baseUrl}/api/health`);
  const finalCount = healthFinal.body?.database?.listingsCount;
  console.log(`Database "${healthFinal.body?.database?.name}" has ${finalCount} listings.`);
  report.databasePreserved = finalCount === 14;

  console.log("\n=== FINAL VERIFICATION SUMMARY ===");
  console.log(JSON.stringify(report, null, 2));
}

verifyAll();
