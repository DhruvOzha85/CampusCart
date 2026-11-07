import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";
import CategoryNav from "@/components/CategoryNav";
import ProductGrid from "@/components/ProductGrid";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";

export const dynamic = "force-dynamic";

export default async function Home() {
  let listings = [];
  try {
    await dbConnect();
    listings = await Listing.find({ status: "Available" })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
  } catch (error) {
    console.error("Home page listing query error:", error);
    listings = [];
  }

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-transparent pt-12 pb-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Marketplace &middot; Live MongoDB Atlas</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.12]">
              Buy & Sell Gear <br />
              <span className="text-emerald-600">Within Your Campus</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Save money on textbooks, electronics, dorm furniture, and supplies.
              Connect directly with verified students for safe, zero-shipping campus pickups.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/marketplace"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition"
              >
                <span>Explore Campus Listings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sell"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 rounded-xl border border-gray-200 shadow-2xs transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Post an Item Free</span>
              </Link>
            </div>

            {/* Value Props */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-200/60 max-w-2xl mx-auto text-left">
              <div className="flex items-center gap-2.5 text-xs text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Zero commission or listing fees</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Safe campus dorm & library handoffs</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-600">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <span>100% Student-to-student trade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Category Navigation */}
        <CategoryNav />

        {/* 3. Featured / Latest Products Section from real MongoDB */}
        <section aria-labelledby="featured-heading">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="featured-heading" className="text-xl font-bold text-gray-900 tracking-tight">
                  Latest Campus Listings
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live MongoDB
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Freshly posted items around your campus dorms and departments
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
            >
              See all items &rarr;
            </Link>
          </div>

          <ProductGrid products={listings} />
        </section>

        {/* 4. CTA Section */}
        <section className="relative overflow-hidden rounded-3xl bg-emerald-800 text-white p-8 sm:p-12 lg:p-16 shadow-lg">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-700/50 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-emerald-900/60 blur-2xl pointer-events-none" />

          <div className="relative max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Turn clutter into cash</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Got stuff sitting in your dorm room?
            </h2>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Don&apos;t let old textbooks, calculators, or dorm gear collect dust. Sell them
              to juniors and peers right on campus. It&apos;s free, takes under two minutes, and
              avoids packaging or shipping hassles.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/sell"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 active:bg-emerald-100 font-semibold px-6 py-3.5 rounded-xl shadow transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>Post Your Item Now</span>
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700/80 hover:bg-emerald-700 text-white font-medium px-6 py-3.5 rounded-xl transition border border-emerald-600"
              >
                <span>Browse Marketplace</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
