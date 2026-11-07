import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid enquiry ID format" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(id)
      .populate("listingId", "title price category images status location sellerName sellerEmail")
      .lean();

    if (!enquiry) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error retrieving enquiry", error: error.message },
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
        { success: false, message: "Invalid enquiry ID format" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status: targetStatus, sellerEmail } = body;

    const validStatuses = ["Pending", "Accepted", "Rejected", "Completed"];
    if (!targetStatus || !validStatuses.includes(targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Verify seller email authorization if provided
    if (sellerEmail) {
      const normalizedSeller = sellerEmail.trim().toLowerCase();
      if (enquiry.sellerEmail && enquiry.sellerEmail.toLowerCase() !== normalizedSeller) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized: You are not the seller of this listing.",
          },
          { status: 403 }
        );
      }
    }

    // Allowed status transitions
    const current = enquiry.status;
    const allowedTransitions = {
      Pending: ["Accepted", "Rejected"],
      Accepted: ["Completed", "Rejected"],
      Rejected: [],
      Completed: [],
    };

    if (current === targetStatus) {
      return NextResponse.json({
        success: true,
        message: `Status is already ${targetStatus}`,
        data: enquiry,
      });
    }

    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status transition from "${current}" to "${targetStatus}". Allowed next states: ${
            allowed.length > 0 ? allowed.join(", ") : "None (terminal state)"
          }`,
        },
        { status: 400 }
      );
    }

    // Update status
    enquiry.status = targetStatus;
    await enquiry.save();

    // Side-effects on the Listing status when enquiry is accepted or completed
    if (targetStatus === "Accepted") {
      await Listing.findByIdAndUpdate(enquiry.listingId, { status: "Reserved" });
    } else if (targetStatus === "Completed") {
      await Listing.findByIdAndUpdate(enquiry.listingId, { status: "Sold" });
    } else if (targetStatus === "Rejected" && current === "Accepted") {
      // Revert from Reserved to Available
      await Listing.findByIdAndUpdate(enquiry.listingId, { status: "Available" });
    }

    const updatedEnquiry = await Enquiry.findById(id)
      .populate("listingId", "title price status")
      .lean();

    return NextResponse.json({
      success: true,
      message: `Enquiry status updated to ${targetStatus}`,
      data: updatedEnquiry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating enquiry status", error: error.message },
      { status: 500 }
    );
  }
}

