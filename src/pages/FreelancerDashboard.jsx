import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/Chatbot";
import "./Dashboard.css";

export default function FreelancerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("matches");

  const [matches, setMatches]       = useState([]);
  const [projects, setProjects]     = useState([]);
  const [proposals, setProposals]   = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [inbox, setInbox]           = useState([]);
  const [messages, setMessages]     = useState([]);
  const [chatWith, setChatWith]     = useState(null);
  const [newMsg, setNewMsg]         = useState("");

  const [resumeFile, setResumeFile]     = useState(null);
  const [parsedSkills, setParsedSkills] = useState([]);
  const [uploadMsg, setUploadMsg]       = useState("");
  const [uploading, setUploading]       = useState(false);

  const [profile, setProfile]       = useState({ skills: "", portfolio: "", hourlyRate: "" });
  const [profileMsg, setProfileMsg] = useState("");

  const [catFilter, setCatFilter]       = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [proposalForm, setProposalForm] = useState({ projectId: null, bidAmount: "", description: "" });
  const [proposalMsg, setProposalMsg]   = useState("");

  const H = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    if (tab === "matches")   fetchMatches();
    if (tab === "browse")    fetchProjects();
    if (tab === "proposals") fetchProposals();
    if (tab === "reviews")   fetchReviews();
    if (tab === "messages")  fetchInbox();
  }, [tab]);

  const fetchMatches   = async () => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/match/freelancer/${user.id}`, H); setMatches(r.data); } catch {} };
  const fetchProjects  = async (cat, bud) => {
    const category = cat !== undefined ? cat : catFilter;
    const maxBudget = bud !== undefined ? bud : budgetFilter;
    try {
      const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, {
        ...H,
        params: { category: category || undefined, maxBudget: maxBudget || undefined }
      });
      setProjects(r.data);
    } catch {}
  };
  const fetchProposals = async () => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/proposals/freelancer/${user.id}`, H); setProposals(r.data); } catch {} };
  const fetchReviews   = async () => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews/freelancer/${user.id}`, H); setReviews(r.data); } catch {} };
  const fetchInbox     = async () => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/inbox/${user.id}`, H); setInbox(r.data); } catch {} };
  const fetchConvo     = async (id) => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversation?userId1=${user.id}&userId2=${id}`, H); setMessages(r.data); } catch {} };

  const submitProposal = async (p) => {
    setProposalMsg("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/proposals`, {
        projectId: p.id, freelancerId: user.id, freelancerName: user.name,
        bidAmount: parseFloat(proposalForm.bidAmount), description: proposalForm.description
      }, H);
      setProposalMsg("Proposal submitted!");
      setProposalForm({ projectId: null, bidAmount: "", description: "" });
    } catch { setProposalMsg("Failed to submit."); }
  };

  const sendMsg = async () => {
    if (!newMsg.trim() || !chatWith) return;
    await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
      senderId: user.id, senderName: user.name,
      receiverId: chatWith.contactId, receiverName: chatWith.contactName,
      content: newMsg
    }, H);
    setNewMsg(""); fetchConvo(chatWith.contactId);
  };

  const handleUpload = async () => {
    if (!resumeFile) return;
    setUploading(true); setUploadMsg(""); setParsedSkills([]);
    const fd = new FormData();
    fd.append("file", resumeFile); fd.append("freelancerId", user.id);
    try {
      const r = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/upload`, fd, {
        headers: { ...H.headers, "Content-Type": "multipart/form-data" }
      });
      setParsedSkills(r.data.skills || []);
      setUploadMsg(r.data.message || "Done!");
    } catch { setUploadMsg("Upload failed. Make sure it's a PDF."); }
    finally { setUploading(false); }
  };

  const saveProfile = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/freelancers/${user.id}/profile`, profile, H);
      setProfileMsg("Profile saved!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch { setProfileMsg("Failed to save."); }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const TABS = [
    { id: "matches",   label: "Matched Projects" },
    { id: "browse",    label: "Browse All Jobs" },
    { id: "proposals", label: "My Proposals" },
    { id: "reviews",   label: "My Reviews" },
    { id: "resume",    label: "Upload Resume" },
    { id: "messages",  label: "Messages" },
    { id: "profile",   label: "My Profile" },
  ];

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-logo">Freelancer Panel</div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            {user?.name}
            <span>{avgRating ? `⭐ ${avgRating} avg rating` : "No reviews yet"}</span>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate("/"); }}>Logout</button>
        </div>
      </aside>

      <div className="dash-content">

        {/* MATCHES */}
        {tab === "matches" && <>
          <div className="page-title">Matched Projects</div>
          <div className="page-sub">Projects ranked by how well your skills match the requirements.</div>
          {matches.length === 0
            ? <div className="empty">No matches found. Add your skills in "My Profile" or upload your resume.</div>
            : <div className="cards-grid">{matches.map(m => (
                <div className="card" key={m.project.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3>{m.project.title}</h3>
                    <span className="match-pct">{m.matchScore}% match</span>
                  </div>
                  {m.project.category && <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{m.project.category}</div>}
                  <p>{m.project.description}</p>
                  <div className="tags">
                    {m.project.requiredSkills?.split(",").map(s => (
                      <span key={s} className={`tag ${m.matchedSkills?.includes(s.trim()) ? "matched" : ""}`}>{s.trim()}</span>
                    ))}
                  </div>
                  <div className="meta-row">
                    {m.project.budget && <span>Budget: ${m.project.budget}</span>}
                    {m.project.deadline && <span>Deadline: {m.project.deadline}</span>}
                    <span>Client: {m.project.clientName}</span>
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-blue btn-sm" onClick={() => { setTab("browse"); setProposalForm({ projectId: m.project.id, bidAmount: "", description: "" }); }}>
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}</div>}
        </>}

        {/* BROWSE */}
        {tab === "browse" && <>
          <div className="page-title">Browse All Jobs</div>
          <div className="page-sub">Find and apply to projects.</div>
          <div className="filter-row">
            <input placeholder="Category" value={catFilter} onChange={e => setCatFilter(e.target.value)} />
            <input placeholder="Max Budget ($)" type="number" value={budgetFilter} onChange={e => setBudgetFilter(e.target.value)} />
            <button className="btn btn-blue btn-sm" onClick={fetchProjects}>Search</button>
            <button className="btn btn-gray btn-sm" onClick={() => { setCatFilter(""); setBudgetFilter(""); fetchProjects(); }}>Clear</button>
          </div>
          {projects.length === 0
            ? <div className="empty">No projects found.</div>
            : <div className="cards-grid">{projects.map(p => (
                <div className="card" key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h3>{p.title}</h3>
                    <span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span>
                  </div>
                  {p.category && <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{p.category}</div>}
                  <p>{p.description}</p>
                  <div className="tags">
                    {p.requiredSkills?.split(",").map(s => <span key={s} className="tag">{s.trim()}</span>)}
                  </div>
                  <div className="meta-row">
                    {p.budget && <span>Budget: ${p.budget}</span>}
                    {p.deadline && <span>Deadline: {p.deadline}</span>}
                    <span>Client: {p.clientName}</span>
                  </div>
                  {p.status === "PENDING" && (
                    proposalForm.projectId === p.id ? (
                      <div className="proposal-box">
                        <input placeholder="Your bid amount ($)" type="number"
                          value={proposalForm.bidAmount}
                          onChange={e => setProposalForm({ ...proposalForm, bidAmount: e.target.value })} />
                        <textarea placeholder="Describe your approach and experience..." rows={3}
                          value={proposalForm.description}
                          onChange={e => setProposalForm({ ...proposalForm, description: e.target.value })} />
                        <div className="card-actions">
                          <button className="btn btn-blue btn-sm" onClick={() => submitProposal(p)}>Submit</button>
                          <button className="btn btn-gray btn-sm" onClick={() => setProposalForm({ projectId: null, bidAmount: "", description: "" })}>Cancel</button>
                        </div>
                        {proposalMsg && <div className="msg-ok">{proposalMsg}</div>}
                      </div>
                    ) : (
                      <div className="card-actions">
                        <button className="btn btn-blue btn-sm" onClick={() => setProposalForm({ projectId: p.id, bidAmount: "", description: "" })}>
                          Submit Proposal
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))}</div>}
        </>}

        {/* PROPOSALS */}
        {tab === "proposals" && <>
          <div className="page-title">My Proposals</div>
          <div className="page-sub">Proposals you have submitted to projects.</div>
          {proposals.length === 0
            ? <div className="empty">You haven't submitted any proposals yet.</div>
            : <div className="table-wrap"><table>
                <thead>
                  <tr><th>Project ID</th><th>Bid Amount</th><th>Description</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>{proposals.map(p => (
                  <tr key={p.id}>
                    <td>#{p.projectId}</td>
                    <td>${p.bidAmount}</td>
                    <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</td>
                    <td><span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                    <td>{p.submittedAt?.split("T")[0]}</td>
                  </tr>
                ))}</tbody>
              </table></div>}
        </>}

        {/* REVIEWS */}
        {tab === "reviews" && <>
          <div className="page-title">My Reviews</div>
          <div className="page-sub">{avgRating ? `Average rating: ${avgRating} / 5` : "No reviews received yet."}</div>
          {reviews.length === 0
            ? <div className="empty">No reviews yet. Complete a project to receive one.</div>
            : reviews.map(r => (
              <div className="review-card" key={r.id}>
                <div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <div className="review-text">"{r.feedback}"</div>
                <div className="review-meta">— {r.clientName} &nbsp;·&nbsp; Project #{r.projectId} &nbsp;·&nbsp; {r.createdAt?.split("T")[0]}</div>
              </div>
            ))}
        </>}

        {/* RESUME */}
        {tab === "resume" && <>
          <div className="page-title">Upload Resume</div>
          <div className="page-sub">Upload your PDF resume to automatically extract and save your skills.</div>
          <div className="simple-form">
            <div className="form-group">
              <label>Select PDF File</label>
              <input
                type="file"
                accept=".pdf"
                onChange={e => {
                  setResumeFile(e.target.files[0]);
                  setUploadMsg("");
                  setParsedSkills([]);
                }}
                style={{ background: "none", border: "1px dashed #444", padding: "10px" }}
              />
            </div>
            {resumeFile && <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Selected: {resumeFile.name}</p>}
            <button className="btn btn-blue" onClick={handleUpload} disabled={!resumeFile || uploading}>
              {uploading ? "Uploading... (may take a few seconds for image PDFs)" : "Upload and Extract Skills"}
            </button>
            {uploadMsg && <div className="msg-ok" style={{ marginTop: "10px" }}>{uploadMsg}</div>}
            {parsedSkills.length > 0 && (
              <div style={{ marginTop: "18px" }}>
                <p style={{ fontSize: "13px", color: "#bbb", marginBottom: "8px" }}>Skills found in your resume:</p>
                <div className="tags">
                  {parsedSkills.map(s => <span key={s} className="tag matched">{s}</span>)}
                </div>
              </div>
            )}
            <div style={{ marginTop: "20px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "6px", padding: "14px" }}>
              <p style={{ fontSize: "13px", color: "#666" }}>
                💡 Both normal and image-based PDFs are supported. Image-based PDFs use OCR and may take a few extra seconds.
              </p>
            </div>
          </div>
        </>}

        {/* MESSAGES */}
        {tab === "messages" && <>
          <div className="page-title">Messages</div>
          <div className="page-sub">Chat with clients.</div>
          <div className="msg-layout">
            <div className="inbox">
              {inbox.length === 0 && <div style={{ padding: "16px", fontSize: "13px", color: "#666" }}>No conversations yet.</div>}
              {inbox.map(c => (
                <div key={c.contactId} className={`inbox-item ${chatWith?.contactId === c.contactId ? "active" : ""}`}
                  onClick={() => { setChatWith(c); fetchConvo(c.contactId); }}>
                  <div className="contact-name">{c.contactName}</div>
                  <div className="preview">{c.lastMessage}</div>
                </div>
              ))}
            </div>
            <div className="chat-box">
              {!chatWith
                ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#666", fontSize: "14px" }}>Select a conversation</div>
                : <>
                  <div className="chat-top">{chatWith.contactName}</div>
                  <div className="chat-msgs">
                    {messages.map(m => (
                      <div key={m.id} className={`bubble ${m.senderId === user.id ? "mine" : "theirs"}`}>
                        {m.content}
                        <span className="time">{m.sentAt?.split("T")[1]?.substring(0, 5)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-row">
                    <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMsg()}
                      placeholder="Type a message..." />
                    <button className="btn btn-blue btn-sm" onClick={sendMsg}>Send</button>
                  </div>
                </>}
            </div>
          </div>
        </>}

        {/* PROFILE */}
        {tab === "profile" && <>
          <div className="page-title">My Profile</div>
          <div className="page-sub">Update your skills, portfolio link, and hourly rate.</div>
          <div className="simple-form">
            <div className="form-group"><label>Name</label><input value={user?.name} readOnly style={{ opacity: 0.5 }} /></div>
            <div className="form-group"><label>Email</label><input value={user?.email} readOnly style={{ opacity: 0.5 }} /></div>
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <textarea value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })}
                rows={3} placeholder="e.g. React, Node.js, Python, SQL" />
            </div>
            <div className="form-group">
              <label>Portfolio URL</label>
              <input value={profile.portfolio} onChange={e => setProfile({ ...profile, portfolio: e.target.value })}
                placeholder="https://yourportfolio.com" />
            </div>
            <div className="form-group">
              <label>Hourly Rate ($/hr)</label>
              <input type="number" value={profile.hourlyRate}
                onChange={e => setProfile({ ...profile, hourlyRate: e.target.value })}
                placeholder="e.g. 25" />
            </div>
            <button className="btn btn-blue" onClick={saveProfile}>Save Profile</button>
            {profileMsg && <div className="msg-ok">{profileMsg}</div>}
          </div>
        </>}

      </div>
      <Chatbot />
    </div>
  );
}