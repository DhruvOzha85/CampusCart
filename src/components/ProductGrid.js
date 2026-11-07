import ProductCard from "./ProductCard";
import { PackageOpen } from "lucide-react";

export default function ProductGrid({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
        <PackageOpen className="w-12 h-12 mx-auto text-gray-400 stroke-1" />
        <h3 className="mt-4 text-base font-semibold text-gray-800">
          No listings found
        </h3>
        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
          No campus items match this criteria yet. Check back soon or list your own!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

