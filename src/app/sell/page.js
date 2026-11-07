import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import SellForm from "@/components/SellForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sell an Item | CampusCart",
  description: "Post or edit a listing on the CampusCart student marketplace.",
};

export default function SellPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <Suspense
        fallback={
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Loading listing form...</p>
          </div>
        }
      >
        <SellForm />
      </Suspense>
    </div>
  );
}
