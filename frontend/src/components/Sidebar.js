import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const navConfigs = {

  citizen: {
    class: "sidebar-citizen",
    role: "Citizen Portal",
    links: [
      { to: "/citizen", icon: "🏠", label: "Dashboard", exact: true },
      { to: "/citizen/report", icon: "📝", label: "Report Incident" },
      { to: "/citizen/complaints", icon: "📋", label: "My Complaints" },
    ],
  },

  admin: {
    class: "sidebar-admin",
    role: "Admin Panel",
    links: [
      { to: "/admin", icon: "📊", label: "Dashboard", exact: true },

      { to: "/admin/complaints", icon: "📋", label: "All Complaints" },

      { to: "/admin/stats", icon: "📈", label: "Analytics" },

      // NEW ADMIN OPTIONS
      { to: "/admin/service-members", icon: "👷", label: "Service Members" },

      { to: "/admin/create-service-member", icon: "➕", label: "Add Service Member" },

      { to: "/admin/teams", icon: "👥", label: "Manage Teams" },

      { to: "/admin/issue-types", icon: "⚠", label: "Issue Types" },
    ],
  },

  service_team: {
    class: "sidebar-service",
    role: "Service Team",
    links: [
      { to: "/service", icon: "🔧", label: "Dashboard", exact: true },
      { to: "/service/complaints", icon: "📋", label: "Assigned Tasks" },
    ],
  },
};

export default function Sidebar() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const config = navConfigs[user?.role] || navConfigs.citizen;

  const handleLogout = () => {

    logout();

    toast.info("Logged out successfully");

    navigate("/login");

  };

  return (

    <div className={`sidebar ${config.class}`}>

      <div className="sidebar-header">

        <div className="logo">🏙️ SmartCity</div>

        <div className="role-badge">{config.role}</div>

      </div>

      <div className="sidebar-user">

        <div className="user-name">{user?.name}</div>

        <div className="user-email">{user?.email}</div>

      </div>

      <nav className="sidebar-nav">

        {config.links.map((link) => (

          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >

            <span className="nav-icon">{link.icon}</span>

            {link.label}

          </NavLink>

        ))}

        <button
          className="nav-item"
          onClick={handleLogout}
          style={{
            marginTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 16
          }}
        >
          <span className="nav-icon">🚪</span>
          Logout
        </button>

      </nav>

    </div>

  );
}