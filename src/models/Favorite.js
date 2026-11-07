import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing ID is required"],
    },
    visitorId: {
      type: String,
      required: [true, "Visitor ID is required"],
      trim: true,
    },
    userIdentifier: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee prevent duplicate favorites
FavoriteSchema.index({ listingId: 1, visitorId: 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);
