import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/Chatbot";
import "./Dashboard.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients]         = useState([]);
  const [projects, setProjects]       = useState([]);
  const [report, setReport]           = useState({});

  const H = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [f, c, p, r] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/freelancers`, H),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/clients`, H),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/projects`, H),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/reports`, H),
      ]);
      setFreelancers(f.data);
      setClients(c.data);
      setProjects(p.data);
      setReport(r.data);
    } catch {}
  };

  const blockUser   = async (id) => { if (!window.confirm("Block this user?")) return; await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/block`, {}, H); fetchAll(); };
  const unblockUser = async (id) => { await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/approve`, {}, H); fetchAll(); };
  const deleteUser  = async (id) => { if (!window.confirm("Delete this user permanently?")) return; await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, H); fetchAll(); };
  const rejectProj  = async (id) => { if (!window.confirm("Reject this project?")) return; await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/projects/${id}/reject`, {}, H); fetchAll(); };
  const approveProj = async (id) => { await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/projects/${id}/approve`, {}, H); fetchAll(); };
  const deleteProj  = async (id) => { if (!window.confirm("Delete this project?")) return; await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/projects/${id}`, H); fetchAll(); };

  const TABS = [
    { id: "overview",    label: "Overview" },
    { id: "freelancers", label: "Freelancers" },
    { id: "clients",     label: "Clients" },
    { id: "projects",    label: "Job Postings" },
    { id: "reports",     label: "System Reports" },
  ];

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-logo">Admin Panel</div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">{user?.name}<span>Administrator</span></div>
          <button className="logout-btn" onClick={() => { logout(); navigate("/"); }}>Logout</button>
        </div>
      </aside>

      <div className="dash-content">

        {/* OVERVIEW */}
        {tab === "overview" && <>
          <div className="page-title">Overview</div>
          <div className="page-sub">Platform summary.</div>
          <div className="stats-row">
            <div className="stat-box"><div className="num">{report.totalUsers || 0}</div><div className="lbl">Total Users</div></div>
            <div className="stat-box"><div className="num">{report.totalFreelancers || 0}</div><div className="lbl">Freelancers</div></div>
            <div className="stat-box"><div className="num">{report.totalClients || 0}</div><div className="lbl">Clients</div></div>
            <div className="stat-box"><div className="num">{report.totalProjects || 0}</div><div className="lbl">Projects</div></div>
            <div className="stat-box"><div className="num">{report.activeProjects || 0}</div><div className="lbl">Ongoing</div></div>
            <div className="stat-box"><div className="num">{report.completedProjects || 0}</div><div className="lbl">Completed</div></div>
          </div>
        </>}

        {/* FREELANCERS */}
        {tab === "freelancers" && <>
          <div className="page-title">Freelancers</div>
          <div className="page-sub">{freelancers.length} registered freelancers.</div>
          <div className="table-wrap"><table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Skills</th><th>Rate</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>{freelancers.map(f => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td style={{ maxWidth: "180px" }}>
                  <div className="tags" style={{ margin: 0 }}>
                    {f.skills?.split(",").slice(0, 3).map(s => <span key={s} className="tag">{s.trim()}</span>)}
                  </div>
                </td>
                <td>{f.hourlyRate ? `$${f.hourlyRate}/hr` : "—"}</td>
                <td><span className={`badge ${(f.accountStatus || "active").toLowerCase()}`}>{f.accountStatus || "ACTIVE"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {f.accountStatus === "BLOCKED"
                      ? <button className="btn btn-green btn-sm" onClick={() => unblockUser(f.id)}>Unblock</button>
                      : <button className="btn btn-gray btn-sm" onClick={() => blockUser(f.id)}>Block</button>}
                    <button className="btn btn-red btn-sm" onClick={() => deleteUser(f.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </>}

        {/* CLIENTS */}
        {tab === "clients" && <>
          <div className="page-title">Clients</div>
          <div className="page-sub">{clients.length} registered clients.</div>
          <div className="table-wrap"><table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>{clients.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td><span className={`badge ${(c.accountStatus || "active").toLowerCase()}`}>{c.accountStatus || "ACTIVE"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {c.accountStatus === "BLOCKED"
                      ? <button className="btn btn-green btn-sm" onClick={() => unblockUser(c.id)}>Unblock</button>
                      : <button className="btn btn-gray btn-sm" onClick={() => blockUser(c.id)}>Block</button>}
                    <button className="btn btn-red btn-sm" onClick={() => deleteUser(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </>}

        {/* JOB POSTINGS */}
        {tab === "projects" && <>
          <div className="page-title">Job Postings</div>
          <div className="page-sub">Manage all project listings.</div>
          <div className="table-wrap"><table>
            <thead>
              <tr><th>Title</th><th>Client</th><th>Category</th><th>Budget</th><th>Status</th><th>Approval</th><th>Actions</th></tr>
            </thead>
            <tbody>{projects.map(p => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.clientName}</td>
                <td>{p.category || "—"}</td>
                <td>{p.budget ? `$${p.budget}` : "—"}</td>
                <td><span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                <td><span className={`badge ${p.approvalStatus?.toLowerCase()}`}>{p.approvalStatus}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {p.approvalStatus === "REJECTED"
                      ? <button className="btn btn-green btn-sm" onClick={() => approveProj(p.id)}>Approve</button>
                      : <button className="btn btn-gray btn-sm" onClick={() => rejectProj(p.id)}>Reject</button>}
                    <button className="btn btn-red btn-sm" onClick={() => deleteProj(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </>}

        {/* REPORTS */}
        {tab === "reports" && <>
          <div className="page-title">System Reports</div>
          <div className="page-sub">Platform-wide statistics.</div>
          <div className="stats-row">
            <div className="stat-box"><div className="num">{report.totalUsers || 0}</div><div className="lbl">Total Users</div></div>
            <div className="stat-box"><div className="num">{report.totalFreelancers || 0}</div><div className="lbl">Freelancers</div></div>
            <div className="stat-box"><div className="num">{report.totalClients || 0}</div><div className="lbl">Clients</div></div>
            <div className="stat-box"><div className="num">{report.totalProjects || 0}</div><div className="lbl">Total Projects</div></div>
            <div className="stat-box"><div className="num">{report.activeProjects || 0}</div><div className="lbl">Active</div></div>
            <div className="stat-box"><div className="num">{report.completedProjects || 0}</div><div className="lbl">Completed</div></div>
          </div>
          <div style={{ marginTop: "20px", background: "#242424", border: "1px solid #333", borderRadius: "6px", padding: "16px", maxWidth: "500px" }}>
            <table style={{ width: "100%", fontSize: "14px" }}>
              <tbody>
                {[
                  ["Total Registered Users",     report.totalUsers || 0],
                  ["Freelancers",                 report.totalFreelancers || 0],
                  ["Clients",                     report.totalClients || 0],
                  ["Total Projects Posted",       report.totalProjects || 0],
                  ["Currently Ongoing",           report.activeProjects || 0],
                  ["Successfully Completed",      report.completedProjects || 0],
                  ["Pending (Awaiting Proposals)",(report.totalProjects || 0) - (report.activeProjects || 0) - (report.completedProjects || 0)],
                ].map(([label, val]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #2a2a2a" }}>
                    <td style={{ padding: "8px 0", color: "#aaa" }}>{label}</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "bold", color: "#7eb8f7" }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

      </div>
      <Chatbot />
    </div>
  );
}