// portal/components/PortalLayout.jsx
// מעטפת האזור האישי: כותרת עליונה + ניווט (עליון בדסקטופ, תחתון במובייל). RTL, Mobile-First.
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiHome, FiFileText, FiMessageSquare, FiLogOut } from "react-icons/fi";
import usePortalAuth from "../hooks/usePortalAuth";

const NAV = [
  { to: "/dashboard", label: "בית", icon: FiHome },
  { to: "/loans", label: "ההלוואות שלי", icon: FiFileText },
  { to: "/inquiries", label: "פניות", icon: FiMessageSquare },
];

export default function PortalLayout() {
  const { userInfo, logout } = usePortalAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" dir="rtl">
      {/* כותרת עליונה */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/333.png" alt="Lobby" className="h-12 w-auto" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">אזור אישי</div>
              <div className="text-xs text-gray-500">
                שלום, {userInfo?.name || "לקוח"}
              </div>
            </div>
          </div>

          {/* ניווט עליון — דסקטופ */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="text-base" />
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <FiLogOut className="text-base" />
              יציאה
            </button>
          </nav>

          {/* יציאה — מובייל */}
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
            aria-label="יציאה"
          >
            <FiLogOut className="text-xl" />
          </button>
        </div>
      </header>

      {/* תוכן */}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5 sm:pb-10">
        <Outlet />
      </main>

      {/* ניווט תחתון — מובייל */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white sm:hidden">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  isActive ? "text-brand-700" : "text-gray-500"
                }`
              }
            >
              <Icon className="text-xl" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
