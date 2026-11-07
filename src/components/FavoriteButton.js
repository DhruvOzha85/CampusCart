"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { getVisitorId } from "@/lib/visitor";

export default function FavoriteButton({ listingId, className = "" }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    const vId = getVisitorId();
    if (!vId) return;

    // Check if this listing is favorited
    fetch(`/api/favorites?visitorId=${encodeURIComponent(vId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const match = json.data.some(
            (item) =>
              (item.listingId?._id || item.listingId) === listingId ||
              (item.listingId?._id || item.listingId)?.toString() === listingId
          );
          setIsFav(match);
        }
      })
      .catch((err) => console.error("Error loading favorite state:", err));
  }, [listingId]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || !listingId) return;
    const vId = getVisitorId();
    if (!vId) return;

    setLoading(true);

    try {
      if (isFav) {
        // DELETE
        const res = await fetch(
          `/api/favorites?listingId=${encodeURIComponent(listingId)}&visitorId=${encodeURIComponent(vId)}`,
          { method: "DELETE" }
        );
        const json = await res.json();
        if (json.success) {
          setIsFav(false);
        }
      } else {
        // POST
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, visitorId: vId }),
        });
        const json = await res.json();
        if (json.success) {
          setIsFav(true);
        }
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={isFav ? "Remove from favorites" : "Save to favorites"}
      className={`p-2 rounded-full transition-all duration-150 backdrop-blur-md shadow-2xs ${
        isFav
          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "bg-white/80 text-gray-400 hover:text-rose-500 hover:bg-white"
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-transform active:scale-125 ${
          isFav ? "fill-rose-500 text-rose-500" : ""
        }`}
      />
    </button>
  );
}

