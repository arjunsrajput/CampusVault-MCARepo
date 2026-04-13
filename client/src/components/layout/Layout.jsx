import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import { useMaterialStore } from "../../store/materialStore.js";
import { getMe } from "../../api/index.js";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function Layout() {
  const { user, logout, updateUser } = useAuthStore();
  const { fetchAll } = useMaterialStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
    getMe()
      .then((res) => updateUser(res.data.user))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const nl = ({ isActive }) => ({
    color: isActive ? "var(--accent2)" : "var(--text2)",
    fontWeight: isActive ? "500" : "400",
    fontSize: "14px",
    padding: "5px 10px",
    borderRadius: "7px",
    background: isActive ? "var(--accent-bg)" : "transparent",
    transition: "all .15s",
    fontFamily: "var(--font-body)",
  });

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <nav
        style={{
          background: "var(--bg2)",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            height: 54,
            gap: 4,
          }}
        >
          <NavLink
            to="/"
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--accent2)",
              marginRight: 12,
              letterSpacing: "-0.02em",
            }}
          >
            MCA<span style={{ color: "var(--text2)" }}>Repo</span>
          </NavLink>

          <NavLink to="/" style={nl}>
            Browse
          </NavLink>
          <NavLink to="/upload" style={nl}>
            Upload
          </NavLink>
          <NavLink to="/gaps" style={nl}>
            Gaps
          </NavLink>
          <NavLink to="/leaderboard" style={nl}>
            Top Uploaders
          </NavLink>
          <NavLink to="/directory" style={nl}>
            Directory
          </NavLink>
          <NavLink to="/calculator" style={nl}>
            GPA Calc
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin" style={nl}>
              Admin
            </NavLink>
          )}

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <NavLink to="/my-uploads" style={nl}>
              My uploads
            </NavLink>
            <NavLink to="/saved" style={nl}>
              Saved
            </NavLink>

            <NavLink
              to="/profile"
              style={{
                ...nl({ isActive: false }),
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--accent-bg)",
                  color: "var(--accent2)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "var(--font-head)",
                }}
              >
                {initials}
              </span>

              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: 1.2,
                }}
              >
                <span>{user?.name?.split(" ")[0]}</span>
                {user?.rollNumber && (
                  <span style={{ fontSize: 10, color: "var(--text3)" }}>
                    {user.rollNumber}
                  </span>
                )}
              </span>
            </NavLink>

            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "28px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
