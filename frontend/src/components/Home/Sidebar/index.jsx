import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Compass,
  Map,
  CalendarDays,
  UserRound,
  LogOut,
} from "lucide-react";

import "./index.css";

const NAVIGATION = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Branches",
    path: "/branches",
    icon: Compass,
  },
  {
    label: "Goal Roadmap",
    path: "/roadmap",
    icon: Map,
  },
  {
    label: "Semester Plan",
    path: "/semester-roadmap",
    icon: CalendarDays,
  },
];

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await onLogout?.();
    } finally {
      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <aside className="sidebar">
      {/* ==================================================
          BRAND
      ================================================== */}

      <div className="sidebar-brand">
        <div className="brand-mark">N</div>

        <div className="brand-content">
          <div className="brand-name">NextStep</div>

          <div className="brand-tagline">Career planning</div>
        </div>
      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav className="sidebar-nav">
        <div className="nav-label">WORKSPACE</div>

        {NAVIGATION.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard" || path === "/roadmap"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <span className="sidebar-icon">
              <Icon size={18} />
            </span>

            <span className="sidebar-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ==================================================
          BOTTOM
      ================================================== */}

      <div className="sidebar-bottom">
        {/* Current career */}
        <div className="career-card">
          <span className="career-label">CURRENT PATH</span>

          <strong className="career-title">
            {user?.careerGoal || "Choose your career"}
          </strong>

          <span className="career-meta">
            {user?.branch || "Branch not selected"}

            {user?.currentSemester && (
              <>
                {" · "}
                Sem {user.currentSemester}
              </>
            )}
          </span>
        </div>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          <span className="sidebar-icon">
            <UserRound size={18} />
          </span>

          <span className="sidebar-text">Profile</span>
        </NavLink>

        {/* Logout */}
        <button
          type="button"
          className="sidebar-link sidebar-logout"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">
            <LogOut size={18} />
          </span>

          <span className="sidebar-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
