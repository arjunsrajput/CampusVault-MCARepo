import { useState } from "react";
import toast from "react-hot-toast";
import { updateProfile, changePassword } from "../api/index.js";
import { useAuthStore } from "../store/authStore.js";
import { BATCHES, MCA_YEARS } from "../utils/constants.js";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    batch: user?.batch || "",
    currentYear: user?.currentYear || "",
    isAlumni: Boolean(user?.isAlumni),
    graduationYear: user?.graduationYear || "",
    company: user?.company || "",
    jobTitle: user?.jobTitle || "",
    city: user?.city || "",
    linkedinUrl: user?.linkedinUrl || "",
    personalEmail: user?.personalEmail || "",
    bio: user?.bio || "",
    directoryVisibility: user?.directoryVisibility || "all",
    showEmail: Boolean(user?.showEmail),
    showLinkedin: user?.showLinkedin !== false,
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6)
      return toast.error("New password must be at least 6 chars");
    setPwLoading(true);
    try {
      await changePassword(pwForm);
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setPwLoading(false);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>
        Profile
      </h2>

      {/* Avatar + name card */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--accent-bg)",
            color: "var(--accent2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "var(--font-head)",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 17,
              fontFamily: "var(--font-head)",
            }}
          >
            {user?.name}
          </p>
          <p style={{ color: "var(--text3)", fontSize: 13 }}>{user?.email}</p>
          {/* <p style={{color:'var(--text3)',fontSize:12,marginTop:2}}>
            Batch {user?.batch} · Year {user?.currentYear} */}
          <p style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>
            {user?.rollNumber && <span>{user.rollNumber} · </span>}
            Batch {user?.batch} · Year {user?.currentYear}
            {user?.role === "admin" && (
              <span
                style={{
                  marginLeft: 8,
                  background: "var(--amber-bg)",
                  color: "var(--amber)",
                  padding: "1px 8px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Admin
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 18,
            fontFamily: "var(--font-head)",
          }}
        >
          Edit profile
        </h3>
        <form
          onSubmit={handleProfile}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div className="form-group">
              <label className="form-label">Batch</label>
              <select
                value={form.batch}
                onChange={(e) => set("batch", e.target.value)}
              >
                {BATCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Current year</label>
              <select
                value={form.currentYear}
                onChange={(e) => set("currentYear", e.target.value)}
                disabled={form.isAlumni}
              >
                {MCA_YEARS.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div className="form-group">
              <label className="form-label">Directory status</label>
              <select
                value={form.isAlumni ? "alumni" : "student"}
                onChange={(e) => set("isAlumni", e.target.value === "alumni")}
              >
                <option value="student">Current student</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Graduation year</label>
              <input
                type="number"
                min="2019"
                max="2100"
                placeholder="e.g. 2027"
                value={form.graduationYear}
                onChange={(e) => set("graduationYear", e.target.value)}
              />
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "var(--font-head)",
              }}
            >
              Directory profile
            </h3>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
              <div className="form-group">
                <label className="form-label">Current company</label>
                <input
                  placeholder="e.g. Infosys"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Job title</label>
                <input
                  placeholder="e.g. Software Engineer"
                  value={form.jobTitle}
                  onChange={(e) => set("jobTitle", e.target.value)}
                />
              </div>
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  placeholder="e.g. Bengaluru"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Personal email</label>
                <input
                  type="email"
                  placeholder="e.g. name@gmail.com"
                  value={form.personalEmail}
                  onChange={(e) => set("personalEmail", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                placeholder="https://linkedin.com/in/yourname"
                value={form.linkedinUrl}
                onChange={(e) => set("linkedinUrl", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Directory message</label>
              <textarea
                rows="3"
                placeholder="Share a short note for your batch or juniors"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
              />
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
              <div className="form-group">
                <label className="form-label">Visibility</label>
                <select
                  value={form.directoryVisibility}
                  onChange={(e) => set("directoryVisibility", e.target.value)}
                >
                  <option value="all">Everyone</option>
                  <option value="same_batch">My batch only</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 10,
                  paddingTop: 4,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--text2)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.showEmail}
                    onChange={(e) => set("showEmail", e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  Show personal email
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--text2)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.showLinkedin}
                    onChange={(e) => set("showLinkedin", e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  Show LinkedIn
                </label>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading}
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 18,
            fontFamily: "var(--font-head)",
          }}
        >
          Change password
        </h3>
        <form
          onSubmit={handlePassword}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={pwForm.newPassword}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-ghost btn-sm"
            disabled={pwLoading}
          >
            {pwLoading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
