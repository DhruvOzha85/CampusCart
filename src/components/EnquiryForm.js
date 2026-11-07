"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Tag,
  Info,
} from "lucide-react";
import { getStoredStudent, setStoredStudent } from "@/lib/visitor";

export default function EnquiryForm({ listingId, listingTitle, listingPrice, sellerName, isSold, isReserved }) {
  const [open, setOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [message, setMessage] = useState(
    `Hi ${sellerName || "there"}, I'm interested in "${listingTitle}" and would like to arrange a campus pickup!`
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Auto-populate student profile from localStorage if available
  useEffect(() => {
    const profile = getStoredStudent();
    if (profile) {
      if (profile.name) setBuyerName(profile.name);
      if (profile.email) setBuyerEmail(profile.email);
    }
  }, []);

  if (isSold) {
    return (
      <div className="p-4 bg-gray-100 rounded-2xl text-center text-xs font-semibold text-gray-500 border border-gray-200">
        This listing is Sold and is no longer accepting enquiries or offers.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!buyerName.trim()) {
      setError("Please provide your name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyerEmail.trim() || !emailRegex.test(buyerEmail.trim())) {
      setError("Please provide a valid college email address.");
      return;
    }

    if (!message.trim()) {
      setError("Please write a message to the seller.");
      return;
    }

    let parsedOffer = null;
    if (offerPrice !== "") {
      parsedOffer = parseFloat(offerPrice);
      if (isNaN(parsedOffer) || parsedOffer < 0) {
        setError("Offer price must be a valid non-negative number.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          message: message.trim(),
          offerPrice: parsedOffer,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit enquiry.");
      }

      // Save student profile to localStorage for convenience
      setStoredStudent({ name: buyerName.trim(), email: buyerEmail.trim().toLowerCase() });

      setSuccess(true);
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setError(err.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {isReserved && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This item is currently <strong>Reserved</strong> for a buyer, but you can still send a backup enquiry.</span>
        </div>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 font-semibold text-sm transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Send On-Campus Enquiry / Make an Offer</span>
        </button>
      ) : (
        <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Contact Seller & Make Offer</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSuccess(false);
                setError("");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium"
            >
              Cancel
            </button>
          </div>

          {success ? (
            <div className="p-4 bg-emerald-100/80 border border-emerald-300 rounded-xl space-y-2 text-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" />
              <p className="text-sm font-bold text-emerald-950">Enquiry Successfully Delivered!</p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your enquiry and offer have been recorded in the database. The seller can accept or reply through the student dashboard and email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Your College Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="jordan.lee@university.edu"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Optional Offer Price */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Optional Offer Price ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder={listingPrice ? `Listed at $${listingPrice.toFixed(2)} — make an offer or leave blank` : "0.00"}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Message to Seller <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={1000}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <p className="text-[10px] text-gray-500 italic">
                * Note: CampusCart uses seller-provided contact details. Email-based identity is a demo mechanism.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Enquiry & Offer</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
