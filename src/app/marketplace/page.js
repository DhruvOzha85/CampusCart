"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  AlertCircle,
  PackageOpen,
  Loader2,
  Tag,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

const CATEGORIES = ["All", "Books", "Electronics", "Furniture", "Stationery", "Other"];
const CONDITIONS = ["All", "Brand New", "Like New", "Gently Used", "Fair"];
const TYPES = ["All", "Sale", "Free", "Exchange"];
const STATUSES = [
  { label: "Available Only", value: "Available" },
  { label: "All Items (incl. Sold)", value: "all" },
  { label: "Sold Only", value: "Sold" },
];

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial query params from URL
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("Available");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState(initialSearch ? "relevance" : "newest");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync category and search query if URL parameters change
  useEffect(() => {
    const urlCat = searchParams.get("category");
    if (urlCat) {
      setCategory(urlCat);
    }
    const urlQuery = searchParams.get("q") || searchParams.get("search");
    if (urlQuery !== null && urlQuery !== undefined) {
      setSearch(urlQuery);
      if (urlQuery.trim()) {
        setSort("relevance");
      }
    }
  }, [searchParams]);

  // Fetch listings from real MongoDB API
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category && category !== "All") params.set("category", category);
      if (condition && condition !== "All") params.set("condition", condition);
      if (type && type !== "All") params.set("type", type);
      if (status) params.set("status", status);
      if (minPrice && minPrice.trim()) params.set("minPrice", minPrice.trim());
      if (maxPrice && maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load listings from database");
      }

      setListings(json.data || []);
    } catch (err) {
      console.error("Fetch listings error:", err);
      setError(err.message || "Could not retrieve marketplace listings.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, type, status, minPrice, maxPrice, sort]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    condition !== "All" ||
    type !== "All" ||
    status !== "Available" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    (sort !== "newest" && sort !== "relevance");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("All");
    setCondition("All");
    setType("All");
    setStatus("Available");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    router.replace("/marketplace");
  };

  return (
    <div className="space-y-6">
      {/* Search and Main Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search textbooks, calculators, dorm chairs, bicycles..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = category.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters row: Condition, Type, Status, Price Range, Sort */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Condition Filter */}
          <div>
            <label className="block text-gray-500 font-medium mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Conditions" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type Filter */}
          <div>
            <label className="block text-gray-500 font-medium mb-1">Listing Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Types" : t}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-gray-500 font-medium mb-1">Availability</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-gray-500 font-medium mb-1">Min Price ($)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-gray-500 font-medium mb-1">Max Price ($)</label>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-gray-500 font-medium mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="relevance">Relevance (Match)</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Clear Filters bar if applied */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
            <span>Filtered results active</span>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content States: Loading, Error, Empty, or Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-600">
            Querying MongoDB for campus listings...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h3 className="text-base font-bold text-red-900">
            Database Query Error
          </h3>
          <p className="text-sm text-red-700 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchListings}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-gray-300 space-y-3">
          <PackageOpen className="w-12 h-12 mx-auto text-gray-400 stroke-1" />
          <h3 className="text-base font-bold text-gray-800">
            No matching listings found
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Try adjusting your search keywords, price limits, category, or condition filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <ProductCard key={item._id.toString()} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function MarketplacePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Campus Marketplace
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse verified second-hand items listed by college peers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sell"
            className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
          >
            + Post Listing
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Loading campus listings...</p>
          </div>
        }
      >
        <MarketplaceContent />
      </Suspense>
    </div>
  );
}
