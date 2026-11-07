import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";
import ProductCard from "@/components/ProductCard";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const email = decodeURIComponent(params.email || "");
  return {
    title: `Seller Profile: ${email} | CampusCart`,
    description: `View student marketplace listings and seller history for ${email} on CampusCart.`,
  };
}

export default async function SellerProfilePage({ params }) {
  const email = decodeURIComponent(params.email || "").toLowerCase().trim();

  await dbConnect();
  const listings = await Listing.find({
    sellerEmail: new RegExp(`^${email}$`, "i"),
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!listings || listings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Seller Not Found
        </h1>
        <p className="text-sm text-gray-500">
          No campus marketplace listings are associated with {email}.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  // Derive seller details from their listings
  const latest = listings[0];
  const sellerName = latest.sellerName || "Campus Student";
  const contactPreference = latest.contactPreference || "Email";
  const sellerPhone = latest.sellerPhone;

  const activeListings = listings.filter((l) => l.status === "Available");
  const reservedListings = listings.filter((l) => l.status === "Reserved");
  const soldListings = listings.filter((l) => l.status === "Sold");

  // Determine whether phone number should be displayed based on seller preference
  const showPhone =
    (contactPreference === "Phone" || contactPreference === "Either") &&
    sellerPhone &&
    sellerPhone.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back navigation */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      {/* Seller Header Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {sellerName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Campus Student Seller
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>Primary Location: {latest.location || "Campus Quad"}</span>
              </p>
            </div>
          </div>

          {/* Contact Details box */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-4 space-y-2 text-xs text-gray-700 min-w-[240px]">
            <p className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">
              Seller-Provided Contact Details
            </p>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
              >
                {email}
              </a>
            </div>

            {showPhone ? (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <a
                  href={`tel:${sellerPhone}`}
                  className="text-gray-800 hover:text-gray-900 font-medium hover:underline"
                >
                  {sellerPhone}
                </a>
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 italic">
                Prefers email contact only
              </div>
            )}

            <div className="pt-1 text-[11px] text-gray-500">
              Preference: <strong className="text-gray-700">{contactPreference}</strong>
            </div>
          </div>
        </div>

        {/* Unauthenticated notice */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>Student Seller Notice:</strong> Contact details are self-reported by student peers. CampusCart does not use formal account authentication.
          </span>
        </div>

        {/* Seller Statistics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Listed
            </p>
            <p className="text-2xl font-black text-gray-900 mt-1">{listings.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Currently Active
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {activeListings.length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Reserved
            </p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {reservedListings.length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Deals Completed
            </p>
            <p className="text-2xl font-black text-gray-900 mt-1">{soldListings.length}</p>
          </div>
        </div>
      </div>

      {/* Active Listings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Active Listings from {sellerName}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {activeListings.length}
            </span>
          </h2>
        </div>

        {activeListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500">
            This seller does not currently have any active items available.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeListings.map((item) => (
              <ProductCard key={item._id.toString()} product={item} />
            ))}
          </div>
        )}
      </section>

      {/* Listing History & Past Deals Section */}
      {(reservedListings.length > 0 || soldListings.length > 0) && (
        <section className="space-y-4 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Listing History & Past Deals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...reservedListings, ...soldListings].map((item) => (
              <ProductCard key={item._id.toString()} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

