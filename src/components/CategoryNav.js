import Link from "next/link";
import { BookOpen, Laptop, Armchair, PenTool, Layers } from "lucide-react";

export const CATEGORIES = [
  {
    name: "Books",
    description: "Course textbooks, prep guides & novels",
    icon: BookOpen,
    href: "/marketplace?category=Books",
    count: "38 items",
  },
  {
    name: "Electronics",
    description: "Calculators, laptops, chargers & monitors",
    icon: Laptop,
    href: "/marketplace?category=Electronics",
    count: "24 items",
  },
  {
    name: "Furniture",
    description: "Desk chairs, mini-fridges & lamps",
    icon: Armchair,
    href: "/marketplace?category=Furniture",
    count: "15 items",
  },
  {
    name: "Stationery",
    description: "Drafting kits, notebooks & binders",
    icon: PenTool,
    href: "/marketplace?category=Stationery",
    count: "19 items",
  },
  {
    name: "Other",
    description: "Bikes, gym gear, dorm decor & more",
    icon: Layers,
    href: "/marketplace?category=Other",
    count: "12 items",
  },
];

export default function CategoryNav() {
  return (
    <section aria-labelledby="categories-heading" className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 id="categories-heading" className="text-xl font-bold text-gray-900 tracking-tight">
            Browse by Category
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Find exactly what you need for this semester
          </p>
        </div>
        <Link
          href="/marketplace"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
        >
          View all categories &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.name}
              href={cat.href}
              className="group bg-white p-4 rounded-xl border border-gray-200/80 hover:border-emerald-500/50 hover:shadow-sm transition-all duration-150 flex flex-col items-start"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

