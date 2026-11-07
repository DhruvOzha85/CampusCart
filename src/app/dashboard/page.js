import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StudentDashboard from "@/components/StudentDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Student Dashboard | CampusCart",
  description: "Manage your listings, enquiries, offers and saved favorites on CampusCart.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <StudentDashboard />
    </div>
  );
}
