import Image from "next/image";
import Link from "next/link";
import { MapPin, Tag } from "lucide-react";
import FavoriteButton from "./FavoriteButton";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

export default function ProductCard({ product }) {
  const productId = product._id ? product._id.toString() : product.id;
  const {
    title,
    price = 0,
    category,
    condition,
    location,
    type = "Sale",
    status = "Available",
  } = product;

  const displayImage =
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : FALLBACK_IMAGE);

  const conditionColors = {
    "Brand New": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Like New": "bg-blue-50 text-blue-700 border-blue-200",
    "Gently Used": "bg-amber-50 text-amber-700 border-amber-200",
    Fair: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const badgeClass =
    conditionColors[condition] || "bg-gray-100 text-gray-700 border-gray-200";

  const isSold = status?.toLowerCase() === "sold";
  const isReserved = status?.toLowerCase() === "reserved";
  const isFree = type === "Free" || price === 0;

  return (
    <article
      className={`group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col relative ${
        isSold ? "opacity-75" : ""
      }`}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        <Image
          src={displayImage}
          alt={title || "Product listing"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Sold / Reserved overlay badge */}
        {isSold && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-2xs flex items-center justify-center z-10">
            <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs uppercase tracking-widest shadow-md">
              Sold
            </span>
          </div>
        )}
        {isReserved && !isSold && (
          <span className="absolute top-3 left-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm uppercase tracking-wide">
            Reserved
          </span>
        )}

        {/* Condition pill (if not reserved) */}
        {!isReserved && !isSold && (
          <span
            className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${badgeClass}`}
          >
            {condition}
          </span>
        )}

        {/* Category tag */}
        <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-white/95 text-gray-700 shadow-xs backdrop-blur-sm">
          {category}
        </span>

        {/* Listing Type Tag (Free or Exchange) */}
        {type === "Free" && (
          <span className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
            Free
          </span>
        )}
        {type === "Exchange" && (
          <span className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
            Exchange
          </span>
        )}
        {/* Favorite button */}
        <FavoriteButton
          listingId={productId}
          className="absolute bottom-3 right-3 z-10"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2">
            {isFree ? (
              <p className="text-xl font-black text-emerald-600 tracking-tight">
                FREE
              </p>
            ) : (
              <p className="text-xl font-bold text-gray-900 tracking-tight">
                ${Number(price).toFixed(2)}
              </p>
            )}

            {type && type !== "Sale" && (
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {type}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-1.5 text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            <Link href={`/product/${productId}`} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {title}
            </Link>
          </h3>
        </div>

        {/* Location & Details */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 truncate max-w-[70%]">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{location}</span>
          </span>
          <span className="text-emerald-600 font-semibold group-hover:underline shrink-0">
            View &rarr;
          </span>
        </div>
      </div>
    </article>
  );
}
