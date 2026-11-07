import Image from "next/image";
import Link from "next/link";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";
import EnquiryForm from "@/components/EnquiryForm";
import FavoriteButton from "@/components/FavoriteButton";
import ProductCard from "@/components/ProductCard";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

export async function generateMetadata({ params }) {
  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { title: "Listing Not Found | CampusCart" };
  }

  await dbConnect();
  const listing = await Listing.findById(id).lean();

  if (!listing) {
    return { title: "Listing Not Found | CampusCart" };
  }

  return {
    title: `${listing.title} | CampusCart`,
    description: listing.description || `Buy ${listing.title} on CampusCart`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return <NotFoundState />;
  }

  await dbConnect();
  const listing = await Listing.findById(id).lean();

  if (!listing) {
    return <NotFoundState />;
  }

  const {
    title,
    description,
    price = 0,
    category,
    condition,
    type = "Sale",
    status = "Available",
    images = [],
    location,
    sellerName,
    sellerEmail,
    sellerPhone,
    contactPreference = "Email",
    createdAt,
  } = listing;

  // Query similar listings in the same category excluding the current one
  const similarListings = await Listing.find({
    category,
    _id: { $ne: listing._id },
    status: "Available",
  })
    .limit(4)
    .lean();

  const displayImage = images && images.length > 0 ? images[0] : FALLBACK_IMAGE;

  const isSold = status?.toLowerCase() === "sold";
  const isReserved = status?.toLowerCase() === "reserved";
  const isFree = type === "Free" || price === 0;

  // Only display phone number if seller explicitly selected Phone or Either as preference
  const showPhone =
    (contactPreference === "Phone" || contactPreference === "Either") &&
    sellerPhone &&
    sellerPhone.trim().length > 0;

  const conditionColors = {
    "Brand New": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Like New": "bg-blue-50 text-blue-700 border-blue-200",
    "Gently Used": "bg-amber-50 text-amber-700 border-amber-200",
    Fair: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const badgeClass =
    conditionColors[condition] || "bg-gray-100 text-gray-700 border-gray-200";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="space-y-6">
        {/* Navigation & Favorite shortcut */}
        <div className="flex items-center justify-between">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campus Marketplace</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span>Save item:</span>
            <FavoriteButton listingId={id} className="border border-gray-200" />
          </div>
        </div>

        {/* Main Listing Card */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 lg:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/60 shadow-2xs">
              <Image
                src={displayImage}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              {/* Overlays */}
              {isSold && (
                <div className="absolute inset-0 bg-gray-900/65 backdrop-blur-2xs flex items-center justify-center z-10">
                  <span className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-extrabold text-sm uppercase tracking-widest shadow-lg">
                    Sold Out
                  </span>
                </div>
              )}
              {isReserved && !isSold && (
                <div className="absolute top-4 left-4 z-10 px-4 py-1.5 rounded-full bg-amber-500 text-white font-bold text-xs uppercase tracking-wide shadow-md">
                  Reserved for Buyer
                </div>
              )}
            </div>

            {/* Additional thumbnails if more than 1 image */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0"
                  >
                    <Image
                      src={img}
                      alt={`${title} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Tags row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                  {condition}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                  {category}
                </span>
                {type === "Free" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                    Free Giveaway
                  </span>
                )}
                {type === "Exchange" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                    Exchange / Trade
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {status}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {title}
              </h1>

              {/* Price */}
              <div>
                {isFree ? (
                  <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                    FREE
                  </p>
                ) : (
                  <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    ${Number(price).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Key info badges */}
              <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pickup Location: <strong>{location}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Listed: {formattedDate}</span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Item Description
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {description || "No additional description provided by seller."}
                </p>
              </div>
            </div>

            {/* Seller Card & Actions */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                      {sellerName ? sellerName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {sellerName}
                      </h3>
                      <p className="text-[11px] text-gray-500">Seller-provided contact</p>
                    </div>
                  </div>

                  {/* Link to Seller Profile */}
                  <Link
                    href={`/seller/${encodeURIComponent(sellerEmail)}`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>Seller Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Direct Contact links */}
                <div className="space-y-2 pt-2 border-t border-gray-200/60 text-xs">
                  {sellerEmail && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a
                        href={`mailto:${sellerEmail}?subject=${encodeURIComponent(
                          `Interested in: ${title} on CampusCart`
                        )}`}
                        className="hover:text-emerald-800 hover:underline font-medium"
                      >
                        {sellerEmail}
                      </a>
                    </div>
                  )}

                  {showPhone ? (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a
                        href={`tel:${sellerPhone}`}
                        className="hover:text-emerald-800 hover:underline font-medium"
                      >
                        {sellerPhone}
                      </a>
                    </div>
                  ) : null}

                  <p className="text-[10px] text-gray-400">
                    Contact preference: {contactPreference}
                  </p>
                </div>
              </div>

              {/* Contact Action button & Enquiry Form */}
              {isSold ? (
                <div className="p-3 bg-gray-100 rounded-xl text-center text-xs font-semibold text-gray-500 border border-gray-200">
                  Item Sold Out
                </div>
              ) : (
                <>
                  <a
                    href={`mailto:${sellerEmail}?subject=${encodeURIComponent(
                      `CampusCart Enquiry: ${title}`
                    )}&body=${encodeURIComponent(
                      `Hi ${sellerName},\n\nI saw your listing for "${title}" ($${price}) on CampusCart and would like to arrange a pickup at ${location}.\n\nAre you available to meet?\n\nThanks!`
                    )}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-sm transition"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Seller Directly</span>
                  </a>

                  <EnquiryForm
                    listingId={id}
                    listingTitle={title}
                    listingPrice={price}
                    sellerName={sellerName}
                    isSold={isSold}
                    isReserved={isReserved}
                  />
                </>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Meet in safe public campus areas (e.g. Student Center, Library)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings Section */}
      {similarListings.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Similar Items in {category}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Other available listings matching this category
              </p>
            </div>
            <Link
              href={`/marketplace?category=${encodeURIComponent(category)}`}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              See all in {category} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarListings.map((simItem) => (
              <ProductCard key={simItem._id.toString()} product={simItem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
        Listing Not Found
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed">
        This listing does not exist in the database or has been removed by the student seller.
      </p>
      <div className="pt-2">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Marketplace</span>
        </Link>
      </div>
    </div>
  );
}
