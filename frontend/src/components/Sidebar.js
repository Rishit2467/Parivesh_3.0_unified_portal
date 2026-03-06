"use client";

// ── Sidebar Navigation ──────────────────────────────────────────────
// Role-aware sidebar — shows different links per role

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Navigation items per role
const navItems = {
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Applications", href: "/admin/applications", icon: "📋" },
    { label: "Categories", href: "/admin/categories", icon: "🏷️" },
    { label: "Sectors", href: "/admin/sectors", icon: "🏭" },
    { label: "Gist Templates", href: "/admin/templates", icon: "📝" },
    { label: "Payments", href: "/admin/payments", icon: "💰" },
  ],
  project_proponent: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "My Applications", href: "/proponent/applications", icon: "📋" },
    { label: "New Application", href: "/proponent/applications/new", icon: "➕" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ],
  scrutiny_team: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Assigned Applications", href: "/scrutiny/applications", icon: "📋" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ],
  mom_team: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Meetings", href: "/mom/meetings", icon: "📅" },
    { label: "Applications", href: "/mom/applications", icon: "📋" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const roleName = user?.role?.name || "";
  const items = navItems[roleName] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-primary-900 text-white
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-6 border-b border-primary-700">
          <span className="text-xl font-bold tracking-tight">PARIVESH</span>
          <span className="ml-1 text-primary-300 text-sm">3.0</span>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-primary-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="mt-4 px-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-primary-700 text-white"
                      : "text-primary-200 hover:bg-primary-800 hover:text-white"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <div className="text-xs text-primary-400">
            Logged in as
          </div>
          <div className="text-sm font-medium text-primary-100 truncate">
            {user?.name}
          </div>
          <div className="text-xs text-primary-400 truncate">
            {user?.email}
          </div>
        </div>
      </aside>
    </>
  );
}
