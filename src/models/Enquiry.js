import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing ID is required"],
    },
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    buyerEmail: {
      type: String,
      required: [true, "Buyer email is required"],
      trim: true,
      lowercase: true,
    },
    sellerEmail: {
      type: String,
      required: [true, "Seller email is required"],
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    offerPrice: {
      type: Number,
      min: [0, "Offer price cannot be negative"],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Accepted", "Rejected", "Completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);
