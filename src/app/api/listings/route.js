import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || searchParams.get("search");
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";

    const query = {};

    // Status filtering: default to 'Available' unless 'all' or specific status requested
    if (status && status.toLowerCase() !== "all") {
      query.status = new RegExp(`^${status}$`, "i");
    } else if (!status) {
      query.status = "Available";
    }

    // Category filter
    if (category && category !== "All" && category.trim() !== "") {
      query.category = new RegExp(`^${category.trim()}$`, "i");
    }

    // Condition filter
    if (condition && condition !== "All" && condition.trim() !== "") {
      query.condition = new RegExp(`^${condition.trim()}$`, "i");
    }

    // Listing Type filter (Sale, Free, Exchange)
    if (type && type !== "All" && type.trim() !== "") {
      query.type = new RegExp(`^${type.trim()}$`, "i");
    }

    // Price range filters
    if (minPrice !== null && minPrice !== undefined && minPrice.trim() !== "") {
      const parsedMin = parseFloat(minPrice);
      if (!isNaN(parsedMin) && parsedMin >= 0) {
        query.price = { ...(query.price || {}), $gte: parsedMin };
      }
    }
    if (maxPrice !== null && maxPrice !== undefined && maxPrice.trim() !== "") {
      const parsedMax = parseFloat(maxPrice);
      if (!isNaN(parsedMax) && parsedMax >= 0) {
        query.price = { ...(query.price || {}), $lte: parsedMax };
      }
    }

    // Search keyword in title or description
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === "price-low" || sort === "price-asc") {
      sortOptions = { price: 1, createdAt: -1 };
    } else if (sort === "price-high" || sort === "price-desc") {
      sortOptions = { price: -1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    let listings = await Listing.find(query).sort(sortOptions).lean();

    // Transparent Relevance sorting when requested and search query exists
    if (sort === "relevance" && search && search.trim() !== "") {
      const qLower = search.trim().toLowerCase();
      listings = listings.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aDesc = (a.description || "").toLowerCase();
        const bDesc = (b.description || "").toLowerCase();

        const getScore = (title, desc) => {
          if (title === qLower) return 100; // Exact title match
          if (title.startsWith(qLower)) return 80; // Starts with title
          if (title.includes(qLower)) return 60; // Title contains term
          if (desc.includes(qLower)) return 30; // Description contains term
          return 10;
        };

        const scoreA = getScore(aTitle, aDesc);
        const scoreB = getScore(bTitle, bDesc);
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return NextResponse.json(
      {
        success: true,
        count: listings.length,
        data: listings,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch listings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      title,
      description,
      price,
      category,
      condition,
      type = "Sale",
      location,
      images,
      image,
      sellerName,
      sellerEmail,
      sellerPhone,
      contactPreference = "Email",
    } = body;

    // Field validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Item title is required" },
        { status: 400 }
      );
    }

    if (title.trim().length > 120) {
      return NextResponse.json(
        { success: false, message: "Title cannot exceed 120 characters" },
        { status: 400 }
      );
    }

    const validCategories = ["Books", "Electronics", "Furniture", "Stationery", "Other"];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: `Category must be one of: ${validCategories.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const validConditions = ["Brand New", "Like New", "Gently Used", "Fair"];
    if (!condition || !validConditions.includes(condition)) {
      return NextResponse.json(
        {
          success: false,
          message: `Condition must be one of: ${validConditions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const validTypes = ["Sale", "Free", "Exchange"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Listing type must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    let parsedPrice = parseFloat(price);
    if (type === "Free") {
      parsedPrice = 0;
    } else {
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { success: false, message: "A valid non-negative price is required" },
          { status: 400 }
        );
      }
    }

    if (!location || !location.trim()) {
      return NextResponse.json(
        { success: false, message: "Campus location is required" },
        { status: 400 }
      );
    }

    if (!sellerName || !sellerName.trim()) {
      return NextResponse.json(
        { success: false, message: "Seller name is required" },
        { status: 400 }
      );
    }

    if (!sellerEmail || !sellerEmail.trim() || !sellerEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid college email address is required" },
        { status: 400 }
      );
    }

    const validPrefs = ["Email", "Phone", "Either"];
    const pref = validPrefs.includes(contactPreference) ? contactPreference : "Email";

    // Image URL processing
    let imageArray = [];
    if (Array.isArray(images) && images.length > 0) {
      imageArray = images.filter((img) => typeof img === "string" && img.trim().length > 0);
    } else if (image && typeof image === "string" && image.trim().length > 0) {
      imageArray = [image.trim()];
    }

    if (imageArray.length === 0) {
      imageArray = ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"];
    }

    const newListing = await Listing.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      price: parsedPrice,
      category,
      condition,
      type,
      status: "Available",
      images: imageArray,
      location: location.trim(),
      sellerName: sellerName.trim(),
      sellerEmail: sellerEmail.trim().toLowerCase(),
      sellerPhone: sellerPhone ? sellerPhone.trim() : "",
      contactPreference: pref,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Listing published successfully",
        data: newListing,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create listing",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
