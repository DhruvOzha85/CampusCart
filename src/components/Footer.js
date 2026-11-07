import Link from "next/link";
import { ShoppingBag, ShieldCheck, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Campus<span className="text-emerald-600">Cart</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              The trusted peer-to-peer campus marketplace designed exclusively for college students to trade, buy, and sell.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/marketplace?category=Books" className="hover:text-emerald-600 transition">
                  Textbooks & Coursework
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Electronics" className="hover:text-emerald-600 transition">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Furniture" className="hover:text-emerald-600 transition">
                  Dorm Furniture
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Stationery" className="hover:text-emerald-600 transition">
                  Stationery & Supplies
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Other" className="hover:text-emerald-600 transition">
                  Other Essentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Safety */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Campus Safety
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Meet in well-lit public campus spots</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Inspect items prior to handover</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified student email required</span>
              </li>
            </ul>
          </div>

          {/* Phase 1 Badge */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Project Status
            </h3>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Phase 1 — Foundation & UI</span>
              </div>
              <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                Demonstration mode with verified database connection readiness.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CampusCart. Built for college campus communities.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
}
