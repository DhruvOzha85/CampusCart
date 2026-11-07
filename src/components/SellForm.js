"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Edit,
} from "lucide-react";
import { getStoredStudent, setStoredStudent } from "@/lib/visitor";

const CATEGORIES = ["Books", "Electronics", "Furniture", "Stationery", "Other"];
const CONDITIONS = ["Brand New", "Like New", "Gently Used", "Fair"];
const TYPES = ["Sale", "Free", "Exchange"];
const PREFERENCES = ["Email", "Phone", "Either"];

const SAMPLE_PHOTO_PRESETS = [
  {
    label: "Textbook",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Electronics",
    url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Dorm Chair",
    url: "https://images.unsplash.com/photo-1580481077195-c3a821a5060f?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Stationery",
    url: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
  },
];

export default function SellForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books",
    condition: "Like New",
    type: "Sale",
    image: "",
    location: "",
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    contactPreference: "Email",
  });

  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pre-fill profile from localStorage if creating new
  useEffect(() => {
    if (!editId) {
      const student = getStoredStudent();
      if (student) {
        setFormData((prev) => ({
          ...prev,
          sellerName: student.name || prev.sellerName,
          sellerEmail: student.email || prev.sellerEmail,
        }));
      }
    }
  }, [editId]);

  // Load existing listing data if editing
  useEffect(() => {
    if (editId) {
      setLoadingEdit(true);
      fetch(`/api/listings/${editId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const d = json.data;
            setFormData({
              title: d.title || "",
              description: d.description || "",
              price: d.type === "Free" ? "0" : d.price?.toString() || "",
              category: d.category || "Books",
              condition: d.condition || "Like New",
              type: d.type || "Sale",
              image: d.images?.[0] || "",
              location: d.location || "",
              sellerName: d.sellerName || "",
              sellerEmail: d.sellerEmail || "",
              sellerPhone: d.sellerPhone || "",
              contactPreference: d.contactPreference || "Email",
            });
          } else {
            setErrorMessage("Listing to edit could not be found.");
          }
        })
        .catch((err) => {
          console.error("Error loading listing for edit:", err);
          setErrorMessage("Failed to load listing details for editing.");
        })
        .finally(() => setLoadingEdit(false));
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "type" && value === "Free") {
        updated.price = "0";
      }
      return updated;
    });
  };

  const handleApplyPreset = (url) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side validation
    if (!formData.title.trim()) {
      setErrorMessage("Please enter an item title.");
      return;
    }

    if (formData.type !== "Free") {
      const numPrice = parseFloat(formData.price);
      if (isNaN(numPrice) || numPrice < 0) {
        setErrorMessage("Please enter a valid non-negative price.");
        return;
      }
    }

    if (!formData.location.trim()) {
      setErrorMessage("Please specify your campus meetup/dorm location.");
      return;
    }

    if (!formData.sellerName.trim()) {
      setErrorMessage("Please provide your name.");
      return;
    }

    if (!formData.sellerEmail.trim() || !formData.sellerEmail.includes("@")) {
      setErrorMessage("Please enter a valid student email address.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: formData.type === "Free" ? 0 : parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        type: formData.type,
        location: formData.location.trim(),
        sellerName: formData.sellerName.trim(),
        sellerEmail: formData.sellerEmail.trim(),
        sellerPhone: formData.sellerPhone.trim(),
        contactPreference: formData.contactPreference,
        images: formData.image.trim() ? [formData.image.trim()] : undefined,
      };

      let res, result;
      if (editId) {
        // PATCH existing listing
        res = await fetch(`/api/listings/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // POST new listing
        res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save listing.");
      }

      // Save student profile
      setStoredStudent({ name: formData.sellerName.trim(), email: formData.sellerEmail.trim().toLowerCase() });

      const targetId = editId || result.data._id;
      setSuccessMessage(editId ? "Listing updated successfully! Redirecting..." : "Listing published successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/product/${targetId}`);
      }, 700);
    } catch (err) {
      console.error("Listing submission error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Loading listing details for editing...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          {editId ? (
            <>
              <Edit className="w-7 h-7 text-emerald-600" />
              <span>Edit Campus Listing</span>
            </>
          ) : (
            <span>List an Item on CampusCart</span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {editId
            ? "Update your item information, price, or contact preferences."
            : "Publish your used textbook, gadget, or furniture to students across campus."}
        </p>
      </div>

      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-900 leading-relaxed">
          <strong>Campus Notice:</strong> Submissions are saved directly to MongoDB Atlas. Contact details are shown only to student peers to coordinate campus pickups.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Item Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={120}
            placeholder="e.g. TI-84 Plus Graphing Calculator, Biology 12th Ed."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Listing Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "Sale" ? "For Sale ($)" : t === "Free" ? "Free Giveaway" : "Exchange / Trade"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Price ($ USD) {formData.type === "Free" && "(Free giveaway)"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={formData.type === "Free" ? "0" : formData.price}
              onChange={handleChange}
              disabled={formData.type === "Free"}
              placeholder="e.g. 25.00"
              className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition ${
                formData.type === "Free" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "text-gray-900 bg-white"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Campus Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. North Dorms, Science Quad, Student Union"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Product Image URL
          </label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/... or paste image web link"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />

          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 pt-1">
            <span className="font-medium">Quick presets:</span>
            {SAMPLE_PHOTO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset.url)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-[11px] font-medium transition"
              >
                +{preset.label}
              </button>
            ))}
          </div>

          {formData.image && (
            <div className="mt-3 relative aspect-video w-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <Image
                src={formData.image}
                alt="Listing preview"
                fill
                className="object-cover"
                onError={() => setErrorMessage("The image URL could not be loaded. Please verify it or use a preset.")}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            maxLength={2000}
            placeholder="Mention semester usage, included accessories, condition details, or pickup times..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-y"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Seller Contact Details & Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                required
                placeholder="e.g. Alex Morgan"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                College Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="sellerEmail"
                value={formData.sellerEmail}
                onChange={handleChange}
                required
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* Contact Preference selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Contact Preference
            </label>
            <div className="flex items-center gap-4 text-xs">
              {PREFERENCES.map((pref) => (
                <label key={pref} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="contactPreference"
                    value={pref}
                    checked={formData.contactPreference === pref}
                    onChange={handleChange}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    {pref === "Email"
                      ? "Email Only (Phone hidden)"
                      : pref === "Phone"
                      ? "Phone Preferred"
                      : "Email or Phone"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white font-semibold shadow-sm transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{editId ? "Updating listing..." : "Publishing to CampusCart..."}</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>{editId ? "Save Listing Changes" : "Publish Listing to MongoDB"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
