import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Listing from "@/models/Listing";
import Enquiry from "@/models/Enquiry";
import Favorite from "@/models/Favorite";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          status: "error",
          app: "CampusCart",
          database: {
            connected: false,
            message: "MONGODB_URI environment variable is missing",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    await dbConnect();

    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return NextResponse.json(
        {
          status: "error",
          app: "CampusCart",
          database: {
            connected: false,
            readyState: mongoose.connection.readyState,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Perform actual MongoDB ping command
    const pingResult = await mongoose.connection.db.command({ ping: 1 });
    const pingOk = pingResult && pingResult.ok === 1;

    // Count documents across all 3 collections
    const listingCount = await Listing.countDocuments();
    const enquiryCount = await Enquiry.countDocuments();
    const favoriteCount = await Favorite.countDocuments();

    return NextResponse.json(
      {
        status: "ok",
        app: "CampusCart",
        database: {
          connected: true,
          name: mongoose.connection.name,
          ping: pingOk ? "success" : "failed",
          listingsCount: listingCount,
          enquiriesCount: enquiryCount,
          favoritesCount: favoriteCount,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        app: "CampusCart",
        database: {
          connected: false,
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
