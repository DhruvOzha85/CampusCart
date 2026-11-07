import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Books", "Electronics", "Furniture", "Stationery", "Other"],
        message: "{VALUE} is not a supported category",
      },
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: {
        values: ["Brand New", "Like New", "Gently Used", "Fair"],
        message: "{VALUE} is not a supported condition",
      },
    },
    type: {
      type: String,
      enum: {
        values: ["Sale", "Free", "Exchange"],
        message: "{VALUE} is not a supported listing type",
      },
      default: "Sale",
    },
    status: {
      type: String,
      enum: {
        values: ["Available", "Reserved", "Sold", "Inactive"],
        message: "{VALUE} is not a supported status",
      },
      default: "Available",
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, "Campus location is required"],
      trim: true,
    },
    sellerName: {
      type: String,
      required: [true, "Seller name is required"],
      trim: true,
    },
    sellerEmail: {
      type: String,
      required: [true, "Seller email is required"],
      trim: true,
      lowercase: true,
    },
    sellerPhone: {
      type: String,
      trim: true,
      default: "",
    },
    contactPreference: {
      type: String,
      enum: {
        values: ["Email", "Phone", "Either"],
        message: "{VALUE} is not a valid contact preference",
      },
      default: "Email",
    },
  },
  {
    timestamps: true,
  }
);

ListingSchema.pre("save", function (next) {
  if (this.type === "Free") {
    this.price = 0;
  }
  next();
});

export default mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
