import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const buyerEmail = searchParams.get("buyerEmail");
    const sellerEmail = searchParams.get("sellerEmail");
    const status = searchParams.get("status");

    const query = {};

    if (listingId) {
      if (!mongoose.Types.ObjectId.isValid(listingId)) {
        return NextResponse.json(
          { success: false, message: "Invalid listing ID format" },
          { status: 400 }
        );
      }
      query.listingId = listingId;
    }

    if (buyerEmail && buyerEmail.trim()) {
      query.buyerEmail = buyerEmail.trim().toLowerCase();
    }

    if (sellerEmail && sellerEmail.trim()) {
      query.sellerEmail = sellerEmail.trim().toLowerCase();
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const enquiries = await Enquiry.find(query)
      .populate("listingId", "title price category images status location sellerName sellerEmail")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching enquiries", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { listingId, buyerName, buyerEmail, message, offerPrice } = body;

    // Validate listing ID
    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return NextResponse.json(
        { success: false, message: "Valid listing ID is required" },
        { status: 400 }
      );
    }

    // Look up real listing to obtain the verified seller email
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status?.toLowerCase() === "sold") {
      return NextResponse.json(
        {
          success: false,
          message: "This item has been marked as Sold and is no longer accepting enquiries or offers.",
        },
        { status: 400 }
      );
    }

    // Validation
    if (!buyerName || !buyerName.trim()) {
      return NextResponse.json(
        { success: false, message: "Your name is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyerEmail || !emailRegex.test(buyerEmail.trim())) {
      return NextResponse.json(
        { success: false, message: "A valid college email address is required" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    let parsedOffer = null;
    if (offerPrice !== undefined && offerPrice !== null && offerPrice !== "") {
      parsedOffer = parseFloat(offerPrice);
      if (isNaN(parsedOffer) || parsedOffer < 0) {
        return NextResponse.json(
          { success: false, message: "Offer price must be a valid non-negative number" },
          { status: 400 }
        );
      }
    }

    // Create enquiry with the actual seller email from the database record
    const enquiry = await Enquiry.create({
      listingId,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim().toLowerCase(),
      sellerEmail: listing.sellerEmail ? listing.sellerEmail.toLowerCase() : "unspecified@university.edu",
      message: message.trim(),
      offerPrice: parsedOffer,
      status: "Pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry and offer sent to seller successfully!",
        data: enquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to send enquiry", error: error.message },
      { status: 500 }
    );
  }
}
