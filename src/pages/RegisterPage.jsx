import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./AuthPages.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("All fields are required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setStep(2);
  };

  const handleRoleSelect = async (role) => {
    if (loading) return;
    setSelectedRole(role);
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        { ...form, role },
        { timeout: 15000 }
      );
      navigate("/login", { state: { success: "Account created! Please login." } });
    } catch (err) {
      const msg =
        err.code === "ECONNABORTED"
          ? "Request timed out. Make sure the backend is running on port 8080."
          : err.response?.data || "Registration failed. Please try again.";
      setError(msg);
      setStep(1);
    } finally {
      setLoading(false);
      setSelectedRole(null);
    }
  };

  const ROLES = [
    { id: "FREELANCER", title: "🧑‍💻 Freelancer", desc: "Find projects that match my skills" },
    { id: "CLIENT",     title: "🏢 Client",        desc: "Post projects and hire freelancers" },
    { id: "ADMIN",      title: "🔧 Admin",          desc: "Manage the platform" },
  ];

  return (
    <div className="auth-page">
      <div className="auth-box">
        {step === 1 ? (
          <>
            <h2>Register</h2>
            <p className="subtitle">Create your account</p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleDetailsSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
              </div>
              <button type="submit" className="auth-btn">Next: Choose Role →</button>
            </form>
            <div className="auth-link">Already have an account? <Link to="/login">Login</Link></div>
          </>
        ) : (
          <>
            <h2>Choose Your Role</h2>
            <p className="subtitle">What will you do on this platform?</p>
            {error && <div className="error-msg">{error}</div>}
            <div className="role-list">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  className="role-btn"
                  onClick={() => handleRoleSelect(r.id)}
                  disabled={loading}
                  style={{ opacity: loading && selectedRole !== r.id ? 0.4 : 1 }}
                >
                  <span className="role-title">
                    {loading && selectedRole === r.id ? "⏳ Creating account..." : r.title}
                  </span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
            {!loading && (
              <button className="back-btn" onClick={() => { setStep(1); setError(""); }}>← Back</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
