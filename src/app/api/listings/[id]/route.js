import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    const listing = await Listing.findById(id).lean();

    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching listing", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate fields if they are included in update
    if (body.price !== undefined) {
      const parsedPrice = parseFloat(body.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Price must be a non-negative number" },
          { status: 400 }
        );
      }
      body.price = parsedPrice;
    }

    if (body.status !== undefined) {
      const validStatuses = ["Available", "Reserved", "Sold", "Inactive"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Status must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    if (body.category !== undefined) {
      const validCategories = ["Books", "Electronics", "Furniture", "Stationery", "Other"];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          {
            success: false,
            message: `Category must be one of: ${validCategories.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    if (body.condition !== undefined) {
      const validConditions = ["Brand New", "Like New", "Gently Used", "Fair"];
      if (!validConditions.includes(body.condition)) {
        return NextResponse.json(
          {
            success: false,
            message: `Condition must be one of: ${validConditions.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    if (body.type !== undefined) {
      const validTypes = ["Sale", "Free", "Exchange"];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          {
            success: false,
            message: `Type must be one of: ${validTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }
      if (body.type === "Free") {
        body.price = 0;
      }
    }

    if (body.contactPreference !== undefined) {
      const validPrefs = ["Email", "Phone", "Either"];
      if (!validPrefs.includes(body.contactPreference)) {
        return NextResponse.json(
          {
            success: false,
            message: `contactPreference must be one of: ${validPrefs.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedListing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
      data: updatedListing,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating listing", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    const deletedListing = await Listing.findByIdAndDelete(id).lean();

    if (!deletedListing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
      data: { id: deletedListing._id },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting listing", error: error.message },
      { status: 500 }
    );
  }
}
