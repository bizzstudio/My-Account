// admin/components/AdminLayout.jsx — מעטפת ניהול: סרגל צד (דסקטופ) + תפריט מובייל. RTL.
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import useAdminAuth from "../hooks/useAdminAuth";

const NAV = [
  { to: "/admin", label: "דשבורד", icon: FiGrid, end: true },
  { to: "/admin/customers", label: "לקוחות", icon: FiUsers },
  { to: "/admin/loans", label: "הלוואות", icon: FiFileText },
  { to: "/admin/inquiries", label: "פניות", icon: FiMessageSquare },
  { to: "/admin/settings", label: "הגדרות", icon: FiSettings },
];

export default function AdminLayout() {
  const { userInfo, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const NavLinks = ({ onClick }) => (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-700 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <Icon className="text-lg" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" dir="rtl">
      {/* סרגל צד — דסקטופ */}
      <aside className="fixed inset-y-0 right-0 hidden w-64 flex-col border-l border-gray-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <img src="/333.png" alt="Lobby" className="h-11 w-auto" />
          <div className="text-sm font-semibold">ניהול הפורטל</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t border-gray-100 p-3">
          <div className="mb-2 px-3 text-xs text-gray-500">
            {userInfo?.name} · {userInfo?.role}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <FiLogOut className="text-lg" />
            יציאה
          </button>
        </div>
      </aside>

      {/* תפריט מובייל */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <div className="text-sm font-semibold">ניהול הפורטל</div>
              <button onClick={() => setOpen(false)}>
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks onClick={() => setOpen(false)} />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm font-medium text-gray-600"
            >
              <FiLogOut className="text-lg" />
              יציאה
            </button>
          </aside>
        </div>
      )}

      {/* תוכן */}
      <div className="lg:mr-64">
        {/* כותרת עליונה — מובייל */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/333.png" alt="Lobby" className="h-10 w-auto" />
            <span className="text-sm font-semibold">ניהול הפורטל</span>
          </div>
          <button onClick={() => setOpen(true)} aria-label="תפריט">
            <FiMenu className="text-2xl" />
          </button>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
