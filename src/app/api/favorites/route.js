import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId") || searchParams.get("userIdentifier") || searchParams.get("userEmail");

    const query = {};
    if (visitorId && visitorId.trim()) {
      const v = visitorId.trim();
      query.$or = [{ visitorId: v }, { userIdentifier: v }];
    }

    const favorites = await Favorite.find(query)
      .populate("listingId")
      .sort({ createdAt: -1 })
      .lean();

    // Gracefully filter out any deleted/missing listings
    const validFavorites = favorites.filter((fav) => fav.listingId !== null);

    return NextResponse.json({
      success: true,
      count: validFavorites.length,
      data: validFavorites,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching favorites", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { listingId, visitorId, userIdentifier, userEmail } = body;

    const vId = visitorId || userIdentifier || userEmail;

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return NextResponse.json(
        { success: false, message: "Valid listing ID is required" },
        { status: 400 }
      );
    }

    if (!vId || !vId.trim()) {
      return NextResponse.json(
        { success: false, message: "Visitor ID is required" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    // Check for existing to prevent duplicate favorites
    const existing = await Favorite.findOne({
      listingId,
      $or: [{ visitorId: vId.trim() }, { userIdentifier: vId.trim() }],
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: "Listing is already in your favorites",
          isFavorite: true,
          data: existing,
        },
        { status: 200 }
      );
    }

    const newFavorite = await Favorite.create({
      listingId,
      visitorId: vId.trim(),
      userIdentifier: vId.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Added to favorites successfully",
        isFavorite: true,
        data: newFavorite,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error adding favorite", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    let listingId = searchParams.get("listingId");
    let visitorId = searchParams.get("visitorId") || searchParams.get("userIdentifier") || searchParams.get("userEmail");

    // Also support JSON body if passed
    if (!listingId || !visitorId) {
      try {
        const body = await request.json();
        if (body.listingId) listingId = body.listingId;
        if (body.visitorId || body.userIdentifier || body.userEmail) {
          visitorId = body.visitorId || body.userIdentifier || body.userEmail;
        }
      } catch (e) {
        // body might be empty, query params are used
      }
    }

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return NextResponse.json(
        { success: false, message: "Valid listing ID is required" },
        { status: 400 }
      );
    }

    if (!visitorId || !visitorId.trim()) {
      return NextResponse.json(
        { success: false, message: "Visitor ID is required" },
        { status: 400 }
      );
    }

    const deleted = await Favorite.findOneAndDelete({
      listingId,
      $or: [{ visitorId: visitorId.trim() }, { userIdentifier: visitorId.trim() }],
    });

    return NextResponse.json({
      success: true,
      message: deleted ? "Removed from favorites" : "Listing was not in favorites",
      isFavorite: false,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error removing favorite", error: error.message },
      { status: 500 }
    );
  }
}
