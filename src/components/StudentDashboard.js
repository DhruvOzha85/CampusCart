"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Heart,
  PlusCircle,
  Trash2,
  RefreshCw,
  AlertCircle,
  User,
  Mail,
  DollarSign,
  Bell,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Tag,
  MapPin,
  Edit,
} from "lucide-react";
import { getVisitorId, getStoredStudent, setStoredStudent, clearStoredStudent } from "@/lib/visitor";

const PRESET_PERSONAS = [
  { name: "Alex Chen", email: "alex.chen@university.edu", role: "Seller (Biology book, etc.)" },
  { name: "David Miller", email: "dmiller@university.edu", role: "Seller (TI-84 Calculator)" },
  { name: "Sophia Patel", email: "spatel@university.edu", role: "Buyer/Seller (Algorithms)" },
];

export default function StudentDashboard() {
  const [visitorId, setVisitorId] = useState("");
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  // Data states from MongoDB
  const [myListings, setMyListings] = useState([]);
  const [receivedEnquiries, setReceivedEnquiries] = useState([]);
  const [sentEnquiries, setSentEnquiries] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Initialize identity from localStorage
  useEffect(() => {
    const vId = getVisitorId();
    setVisitorId(vId);

    const stored = getStoredStudent();
    if (stored && stored.email) {
      setProfile(stored);
      setInputName(stored.name || "");
      setInputEmail(stored.email || "");
    } else {
      // Default initial persona for instant demonstration
      const defaultStudent = { name: "Alex Chen", email: "alex.chen@university.edu" };
      setProfile(defaultStudent);
      setInputName(defaultStudent.name);
      setInputEmail(defaultStudent.email);
      setStoredStudent(defaultStudent);
    }
  }, []);

  // Fetch all dashboard data from MongoDB
  const fetchDashboardData = useCallback(async () => {
    if (!profile?.email) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const email = profile.email.toLowerCase().trim();
      const vId = getVisitorId();

      // 1. My Listings
      const listingsRes = await fetch(`/api/listings?status=all`);
      const listingsJson = await listingsRes.json();
      const allItems = listingsJson.success && Array.isArray(listingsJson.data) ? listingsJson.data : [];
      const userItems = allItems.filter(
        (item) => item.sellerEmail && item.sellerEmail.toLowerCase() === email
      );
      setMyListings(userItems);

      // 2. Received Enquiries
      const recRes = await fetch(`/api/enquiries?sellerEmail=${encodeURIComponent(email)}`);
      const recJson = await recRes.json();
      setReceivedEnquiries(recJson.success && Array.isArray(recJson.data) ? recJson.data : []);

      // 3. Sent Enquiries
      const sentRes = await fetch(`/api/enquiries?buyerEmail=${encodeURIComponent(email)}`);
      const sentJson = await sentRes.json();
      setSentEnquiries(sentJson.success && Array.isArray(sentJson.data) ? sentJson.data : []);

      // 4. Favorites
      const favRes = await fetch(`/api/favorites?visitorId=${encodeURIComponent(vId)}`);
      const favJson = await favRes.json();
      setFavorites(favJson.success && Array.isArray(favJson.data) ? favJson.data : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setStatusMessage({ type: "error", text: "Failed to load dashboard data from database." });
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle identity update
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!inputEmail.trim() || !inputEmail.includes("@")) {
      setStatusMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    const updated = {
      name: inputName.trim() || "Student",
      email: inputEmail.trim().toLowerCase(),
    };
    setProfile(updated);
    setStoredStudent(updated);
    setEditingProfile(false);
    setStatusMessage({ type: "success", text: `Switched demo identity to ${updated.name} (${updated.email})` });
  };

  const handleSelectPersona = (persona) => {
    setInputName(persona.name);
    setInputEmail(persona.email);
    const updated = { name: persona.name, email: persona.email.toLowerCase() };
    setProfile(updated);
    setStoredStudent(updated);
    setEditingProfile(false);
    setStatusMessage({ type: "success", text: `Active student profile: ${persona.name}` });
  };

  // Change listing status (Available, Reserved, Sold)
  const handleUpdateListingStatus = async (listingId, newStatus) => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update listing status");
      }
      setStatusMessage({ type: "success", text: `Listing status updated to ${newStatus}` });
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating status:", err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete listing with confirmation
  const handleDeleteListing = async (listingId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete listing");
      }
      setStatusMessage({ type: "success", text: `Deleted "${title}" successfully.` });
      fetchDashboardData();
    } catch (err) {
      console.error("Error deleting listing:", err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Enquiry status (Accept, Reject, Complete)
  const handleUpdateEnquiryStatus = async (enquiryId, targetStatus) => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          sellerEmail: profile.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to update enquiry to ${targetStatus}`);
      }
      setStatusMessage({ type: "success", text: `Enquiry marked as ${targetStatus}.` });
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating enquiry:", err);
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Remove item from favorites
  const handleRemoveFavorite = async (listingId) => {
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/favorites?listingId=${encodeURIComponent(listingId)}&visitorId=${encodeURIComponent(visitorId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setFavorites((prev) => prev.filter((f) => (f.listingId?._id || f.listingId) !== listingId));
        setStatusMessage({ type: "success", text: "Removed from saved favorites." });
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Derived real metrics
  const activeListingsCount = myListings.filter((i) => i.status === "Available").length;
  const reservedListingsCount = myListings.filter((i) => i.status === "Reserved").length;
  const soldListingsCount = myListings.filter((i) => i.status === "Sold").length;
  const pendingOffersCount = receivedEnquiries.filter((e) => e.status === "Pending" && e.offerPrice !== null).length;

  // Build notifications from real enquiry records
  const notifications = [
    ...receivedEnquiries.map((e) => ({
      id: `rec_${e._id}`,
      type: "received",
      title: e.offerPrice !== null ? `New offer of $${e.offerPrice.toFixed(2)} received` : "New enquiry received",
      desc: `${e.buyerName} asked about "${e.listingId?.title || "your listing"}"`,
      status: e.status,
      date: e.createdAt,
    })),
    ...sentEnquiries.map((e) => ({
      id: `sent_${e._id}`,
      type: "sent",
      title: `Your offer/enquiry was marked ${e.status}`,
      desc: `On "${e.listingId?.title || "item"}"`,
      status: e.status,
      date: e.updatedAt || e.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Identity Banner */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-lg shrink-0">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {profile?.name || "Student Profile"}
              </h1>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Demo Student Mode
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{profile?.email || "No email selected"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setEditingProfile(!editingProfile)}
            className="text-xs font-semibold px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
          >
            {editingProfile ? "Close Switcher" : "Switch Demo Identity"}
          </button>
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="text-xs font-semibold px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/sell"
            className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Sell New Item</span>
          </Link>
        </div>
      </div>

      {/* Identity Switcher Dropdown/Form */}
      {editingProfile && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Switch Student Identity
              </h3>
              <p className="text-xs text-emerald-800">
                Email-based identity is a demo mechanism to view seller listings and buyer enquiries.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-emerald-900">Sample Personas:</span>
            {PRESET_PERSONAS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleSelectPersona(p)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                  profile?.email === p.email
                    ? "bg-emerald-700 text-white border-emerald-800 shadow-2xs"
                    : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {p.name} ({p.role})
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <input
              type="text"
              placeholder="Your Name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <input
              type="email"
              placeholder="College Email Address"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Apply Identity
            </button>
          </form>
        </div>
      )}

      {/* Global Status Message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            statusMessage.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
      )}

      {/* Dashboard Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 scrollbar-none text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === "overview"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview & Metrics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "listings"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>My Listings</span>
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-700">
            {myListings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "received"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Received Enquiries</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-800">
            {receivedEnquiries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "sent"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Sent Enquiries</span>
          <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-700">
            {sentEnquiries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "favorites"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Saved Favorites</span>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-[10px] text-rose-700">
            {favorites.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading student dashboard records from MongoDB...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{activeListingsCount}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Available items</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reserved</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{reservedListingsCount}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Deal pending</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sold</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{soldListingsCount}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Completed deals</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Received</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{receivedEnquiries.length}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Buyer enquiries</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sent</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{sentEnquiries.length}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Items asked about</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Offers</p>
                  <p className="text-2xl font-black text-purple-600 mt-1">{pendingOffersCount}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Pending price offers</p>
                </div>
              </div>

              {/* STEP 5: Notifications Area */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span>Recent Activity & Notifications</span>
                  </h3>
                  <span className="text-xs text-gray-400">Derived from MongoDB records</span>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">
                    No recent activity yet. Submit an enquiry or list an item to see updates.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 6).map((n) => (
                      <div key={n.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <p className="font-semibold text-gray-900">{n.title}</p>
                          <p className="text-gray-500 mt-0.5">{n.desc}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] shrink-0 ${
                            n.status === "Accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : n.status === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : n.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {n.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY LISTINGS */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Listings associated with <strong>{profile?.email}</strong>
                </p>
                <Link
                  href="/sell"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add another item</span>
                </Link>
              </div>

              {myListings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-gray-400 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800">No Listings Found for This Email</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    You have not published any items under {profile?.email}. Post an item or switch to a demo seller identity (e.g. Alex Chen).
                  </p>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Post an item now
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm divide-y divide-gray-100">
                  {myListings.map((item) => (
                    <div
                      key={item._id.toString()}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <Image
                            src={
                              item.images?.[0] ||
                              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
                            }
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/product/${item._id}`}
                            className="text-sm font-bold text-gray-900 hover:text-emerald-600 transition"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="font-bold text-gray-900">
                              {item.type === "Free" ? "FREE" : `$${item.price.toFixed(2)}`}
                            </span>
                            <span>&middot;</span>
                            <span>{item.category}</span>
                            <span>&middot;</span>
                            <span>{item.condition}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Dropdown, Deactivate & Actions */}
                      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                        <div className="flex items-center gap-1.5 text-xs">
                          <label className="text-gray-500">Status:</label>
                          <select
                            value={item.status}
                            disabled={actionLoading}
                            onChange={(e) => handleUpdateListingStatus(item._id, e.target.value)}
                            className="py-1 px-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="Available">Available</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Sold">Sold</option>
                            <option value="Inactive">Inactive (Deactivated)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleUpdateListingStatus(item._id, item.status === "Inactive" ? "Available" : "Inactive")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            item.status === "Inactive"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {item.status === "Inactive" ? "Reactivate" : "Deactivate"}
                        </button>

                        <Link
                          href={`/sell?edit=${item._id}`}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Listing"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleDeleteListing(item._id, item.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECEIVED ENQUIRIES */}
          {activeTab === "received" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Enquiries and offers from student buyers for listings owned by <strong>{profile?.email}</strong>
              </p>

              {receivedEnquiries.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                  <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800">No Enquiries Received Yet</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    When other students ask about your items or submit price offers, they will appear here with Accept/Reject actions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedEnquiries.map((enq) => (
                    <div
                      key={enq._id}
                      className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {enq.listingId?.title || "Listing"}
                            </span>
                            {enq.offerPrice !== null && (
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Offer: ${enq.offerPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            From <strong>{enq.buyerName}</strong> ({enq.buyerEmail})
                          </p>
                        </div>

                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                            enq.status === "Accepted"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : enq.status === "Rejected"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : enq.status === "Completed"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed">
                        &ldquo;{enq.message}&rdquo;
                      </div>

                      {/* Action buttons based on status transitions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <span className="text-gray-400">
                          {new Date(enq.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {enq.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateEnquiryStatus(enq._id, "Accepted")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                              >
                                Accept Offer
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateEnquiryStatus(enq._id, "Rejected")}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {enq.status === "Accepted" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateEnquiryStatus(enq._id, "Completed")}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                              >
                                Mark Deal Completed
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdateEnquiryStatus(enq._id, "Rejected")}
                                className="px-3 py-1.5 text-gray-500 hover:text-red-600 transition"
                              >
                                Cancel / Reject
                              </button>
                            </>
                          )}

                          {(enq.status === "Rejected" || enq.status === "Completed") && (
                            <span className="text-gray-400 italic">No further actions</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SENT ENQUIRIES */}
          {activeTab === "sent" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Enquiries and offers submitted by you (<strong>{profile?.email}</strong>) to sellers
              </p>

              {sentEnquiries.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                  <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800">No Sent Enquiries</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Browse the marketplace and submit an enquiry or offer on a textbook or tech item.
                  </p>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentEnquiries.map((enq) => (
                    <div
                      key={enq._id}
                      className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {enq.listingId?.title || "Item"}
                            </span>
                            {enq.offerPrice !== null && (
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Your Offer: ${enq.offerPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Seller contact: {enq.sellerEmail}
                          </p>
                        </div>

                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                            enq.status === "Accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : enq.status === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : enq.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Status: {enq.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700">
                        &ldquo;{enq.message}&rdquo;
                      </div>

                      {enq.listingId?._id && (
                        <div className="pt-2 flex justify-end">
                          <Link
                            href={`/product/${enq.listingId._id}`}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <span>View item details</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FAVORITES */}
          {activeTab === "favorites" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Items you bookmarked in this browser (Visitor ID: <code className="text-gray-400">{visitorId}</code>)
              </p>

              {favorites.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-gray-400 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800">No Saved Favorites</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Click the heart icon on any card across the marketplace to save items for quick access here.
                  </p>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Explore Items
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((fav) => {
                    const item = fav.listingId;
                    if (!item) return null;
                    return (
                      <div
                        key={fav._id}
                        className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-2xs flex flex-col justify-between"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                  {item.category}
                                </span>
                                {item.status !== "Available" && (
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      item.status === "Sold"
                                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                                        : item.status === "Reserved"
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                    }`}
                                  >
                                    {item.status === "Sold"
                                      ? "Unavailable (Sold)"
                                      : item.status === "Reserved"
                                      ? "Reserved"
                                      : "Deactivated"}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mt-0.5">
                                {item.title}
                              </h4>
                            </div>
                            <span className="text-sm font-black text-gray-900">
                              {item.type === "Free" ? "FREE" : `$${item.price.toFixed(2)}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{item.location}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                          <Link
                            href={`/product/${item._id}`}
                            className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            <span>View item</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveFavorite(item._id)}
                            className="text-gray-400 hover:text-rose-600 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

