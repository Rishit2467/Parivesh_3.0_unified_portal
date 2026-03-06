"use client";

// ── Top Navigation Bar ───────────────────────────────────────────────
// Shows app title, user info, and logout button

import { useAuth } from "@/contexts/AuthContext";

const roleBadgeColor = {
  admin: "bg-red-100 text-red-700",
  project_proponent: "bg-blue-100 text-blue-700",
  scrutiny_team: "bg-yellow-100 text-yellow-700",
  mom_team: "bg-purple-100 text-purple-700",
};

const roleLabel = {
  admin: "Admin",
  project_proponent: "Project Proponent",
  scrutiny_team: "Scrutiny Team",
  mom_team: "MoM Team",
};

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const roleName = user?.role?.name || "";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="tricolor-bar" />
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-primary-700">PARIVESH 3.0</h1>
          </div>
        </div>

        {/* Right: role badge + user + logout */}
        <div className="flex items-center gap-4">
          <span className={`badge ${roleBadgeColor[roleName] || "bg-gray-100 text-gray-700"}`}>
            {roleLabel[roleName] || roleName}
          </span>
          <span className="text-sm text-gray-600 hidden sm:inline">
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
