import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/Chatbot";
import "./Dashboard.css";

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("projects");

  const [projects, setProjects]   = useState([]);
  const [form, setForm]           = useState({ title: "", description: "", requiredSkills: "", budget: "", category: "", deadline: "" });
  const [postMsg, setPostMsg]     = useState("");
  const [posting, setPosting]     = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [proposals, setProposals]             = useState([]);
  const [matches, setMatches]                 = useState([]);

  const [freelancers, setFreelancers] = useState([]);

  const [reviewForm, setReviewForm] = useState({ projectId: "", freelancerId: "", rating: 5, feedback: "" });
  const [reviewMsg, setReviewMsg]   = useState("");

  const [inbox, setInbox]       = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatWith, setChatWith] = useState(null);
  const [newMsg, setNewMsg]     = useState("");

  const H = { headers: { Authorization: `Bearer ${user?.token}` } };

  useEffect(() => {
    if (tab === "projects" || tab === "proposals") fetchProjects();
    if (tab === "browse" || tab === "review") fetchFreelancers();
    if (tab === "review") fetchProjects();
    if (tab === "messages") fetchInbox();
  }, [tab]);

  const fetchProjects    = async () => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/client/${user.id}`, H); setProjects(r.data); } catch {} };
  const fetchFreelancers = async () => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/freelancers`, H); setFreelancers(r.data); } catch {} };
  const fetchProposals   = async (p) => { setSelectedProject(p); setTab("proposals"); try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/proposals/project/${p.id}`, H); setProposals(r.data); } catch {} };
  const fetchMatches     = async (p) => { setSelectedProject(p); setTab("matches");   try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/match/project/${p.id}`, H); setMatches(r.data); } catch {} };
  const fetchInbox       = async ()  => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/inbox/${user.id}`, H); setInbox(r.data); } catch {} };
  const fetchConvo       = async (id) => { try { const r = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversation?userId1=${user.id}&userId2=${id}`, H); setMessages(r.data); } catch {} };

  const postProject = async (e) => {
    e.preventDefault(); setPosting(true); setPostMsg("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects`, { ...form, clientId: user.id, clientName: user.name }, H);
      setPostMsg("Project posted successfully!");
      setForm({ title: "", description: "", requiredSkills: "", budget: "", category: "", deadline: "" });
      fetchProjects();
    } catch { setPostMsg("Failed to post project."); }
    finally { setPosting(false); }
  };

  const acceptProposal = async (id) => { try { await axios.put(`${import.meta.env.VITE_API_URL}/api/proposals/${id}/accept`, {}, H); fetchProposals(selectedProject); } catch {} };
  const rejectProposal = async (id) => { try { await axios.put(`${import.meta.env.VITE_API_URL}/api/proposals/${id}/reject`, {}, H); fetchProposals(selectedProject); } catch {} };

  const submitReview = async () => {
    setReviewMsg("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reviews`, { ...reviewForm, clientId: user.id, clientName: user.name }, H);
      setReviewMsg("Review submitted! Project marked as completed.");
      setReviewForm({ projectId: "", freelancerId: "", rating: 5, feedback: "" });
    } catch { setReviewMsg("Failed to submit review."); }
  };

  const sendMsg = async (receiverId, receiverName) => {
    if (!newMsg.trim()) return;
    await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
      senderId: user.id, senderName: user.name, receiverId, receiverName, content: newMsg
    }, H);
    setNewMsg(""); fetchConvo(receiverId);
  };

  const messageFreelancer = (f) => {
    setChatWith({ contactId: f.id, contactName: f.name });
    setTab("messages");
    fetchConvo(f.id);
  };

  const TABS = [
    { id: "projects",  label: "My Projects" },
    { id: "post",      label: "Post a Project" },
    { id: "proposals", label: "View Proposals" },
    { id: "matches",   label: "Find Freelancers" },
    { id: "browse",    label: "Browse Freelancers" },
    { id: "review",    label: "Give Review" },
    { id: "messages",  label: "Messages" },
  ];

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-logo">Client Panel</div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">{user?.name}<span>Client</span></div>
          <button className="logout-btn" onClick={() => { logout(); navigate("/"); }}>Logout</button>
        </div>
      </aside>

      <div className="dash-content">

        {/* MY PROJECTS */}
        {tab === "projects" && <>
          <div className="page-title">My Projects</div>
          <div className="page-sub">All projects you have posted.</div>
          {projects.length === 0
            ? <div className="empty">No projects yet. Go to "Post a Project" to add one.</div>
            : <div className="cards-grid">{projects.map(p => (
                <div className="card" key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
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
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-gray btn-sm" onClick={() => fetchProposals(p)}>View Proposals</button>
                    <button className="btn btn-blue btn-sm" onClick={() => fetchMatches(p)}>Find Matches</button>
                  </div>
                </div>
              ))}</div>}
        </>}

        {/* POST PROJECT */}
        {tab === "post" && <>
          <div className="page-title">Post a Project</div>
          <div className="page-sub">Fill in the details below to find freelancers.</div>
          <form onSubmit={postProject} className="simple-form">
            <div className="form-group">
              <label>Project Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Build a Portfolio Website" required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe what you need..." required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Web Development, Design" />
            </div>
            <div className="form-group">
              <label>Required Skills * (comma separated)</label>
              <input value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })} placeholder="e.g. React, Node.js, MongoDB" required />
            </div>
            <div className="two-col">
              <div className="form-group">
                <label>Budget ($)</label>
                <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 500" />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-blue" disabled={posting}>{posting ? "Posting..." : "Post Project"}</button>
            {postMsg && <div className="msg-ok">{postMsg}</div>}
          </form>
        </>}

        {/* PROPOSALS */}
        {tab === "proposals" && <>
          <div className="page-title">Proposals</div>
          <div className="page-sub">{selectedProject ? `For project: ${selectedProject.title}` : "Click View Proposals on any project."}</div>
          {proposals.length === 0
            ? <div className="empty">No proposals received yet.</div>
            : <div className="table-wrap"><table>
                <thead>
                  <tr><th>Freelancer</th><th>Bid</th><th>Description</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>{proposals.map(p => (
                  <tr key={p.id}>
                    <td>{p.freelancerName}</td>
                    <td>${p.bidAmount}</td>
                    <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</td>
                    <td><span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                    <td>
                      {p.status === "PENDING" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btn-green btn-sm" onClick={() => acceptProposal(p.id)}>Accept</button>
                          <button className="btn btn-red btn-sm" onClick={() => rejectProposal(p.id)}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}</tbody>
              </table></div>}
        </>}

        {/* FIND MATCHES */}
        {tab === "matches" && <>
          <div className="page-title">Matched Freelancers</div>
          <div className="page-sub">{selectedProject ? `Best matches for: ${selectedProject.title}` : "Click Find Matches on any project."}</div>
          {matches.length === 0
            ? <div className="empty">No matches found. Make sure your project has required skills listed.</div>
            : <div className="cards-grid">{matches.map(m => (
                <div className="card" key={m.freelancer.id}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h3>{m.freelancer.name}</h3>
                    <span className="match-pct">{m.matchScore}% match</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>{m.freelancer.email}</div>
                  {m.freelancer.hourlyRate && <div style={{ fontSize: "13px", color: "#bbb", marginBottom: "6px" }}>Rate: ${m.freelancer.hourlyRate}/hr</div>}
                  <div className="tags">
                    {m.freelancer.skills?.split(",").map(s => (
                      <span key={s} className={`tag ${m.matchedSkills?.includes(s.trim()) ? "matched" : ""}`}>{s.trim()}</span>
                    ))}
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-blue btn-sm" onClick={() => messageFreelancer(m.freelancer)}>Message</button>
                    {m.freelancer.portfolio && (
                      <a href={m.freelancer.portfolio} target="_blank" rel="noreferrer"
                        className="btn btn-gray btn-sm" style={{ textDecoration: "none" }}>Portfolio</a>
                    )}
                  </div>
                </div>
              ))}</div>}
        </>}

        {/* BROWSE FREELANCERS */}
        {tab === "browse" && <>
          <div className="page-title">Browse Freelancers</div>
          <div className="page-sub">All registered freelancers on the platform.</div>
          {freelancers.length === 0
            ? <div className="empty">No freelancers registered yet.</div>
            : <div className="cards-grid">{freelancers.map(f => (
                <div className="card" key={f.id}>
                  <h3>{f.name}</h3>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>{f.email}</div>
                  {f.hourlyRate && <div style={{ fontSize: "13px", color: "#bbb", marginBottom: "6px" }}>Rate: ${f.hourlyRate}/hr</div>}
                  <div className="tags">
                    {f.skills?.split(",").map(s => <span key={s} className="tag">{s.trim()}</span>)}
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-blue btn-sm" onClick={() => messageFreelancer(f)}>Message</button>
                    {f.portfolio && (
                      <a href={f.portfolio} target="_blank" rel="noreferrer"
                        className="btn btn-gray btn-sm" style={{ textDecoration: "none" }}>Portfolio</a>
                    )}
                  </div>
                </div>
              ))}</div>}
        </>}

        {/* GIVE REVIEW */}
        {tab === "review" && <>
          <div className="page-title">Give a Review</div>
          <div className="page-sub">Rate a freelancer after they complete your project.</div>
          <div className="simple-form">
            <div className="form-group">
              <label>Select Project</label>
              <select value={reviewForm.projectId} onChange={e => setReviewForm({ ...reviewForm, projectId: e.target.value })}
                style={{ background: "#242424", border: "1px solid #444", color: "#e0e0e0", padding: "10px", borderRadius: "6px", width: "100%" }}>
                <option value="">-- Select a project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>#{p.id} — {p.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Freelancer</label>
              <select value={reviewForm.freelancerId} onChange={e => setReviewForm({ ...reviewForm, freelancerId: e.target.value })}
                style={{ background: "#242424", border: "1px solid #444", color: "#e0e0e0", padding: "10px", borderRadius: "6px", width: "100%" }}>
                <option value="">-- Select a freelancer --</option>
                {freelancers.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    className={`star-btn ${reviewForm.rating >= n ? "on" : ""}`}
                    onClick={() => setReviewForm({ ...reviewForm, rating: n })}>★</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea value={reviewForm.feedback} onChange={e => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                rows={4} placeholder="Share your experience working with this freelancer..." />
            </div>
            <button className="btn btn-blue" onClick={submitReview}>Submit Review</button>
            {reviewMsg && <div className="msg-ok">{reviewMsg}</div>}
          </div>
        </>}

        {/* MESSAGES */}
        {tab === "messages" && <>
          <div className="page-title">Messages</div>
          <div className="page-sub">Chat with freelancers.</div>
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
                      onKeyDown={e => e.key === "Enter" && sendMsg(chatWith.contactId, chatWith.contactName)}
                      placeholder="Type a message..." />
                    <button className="btn btn-blue btn-sm" onClick={() => sendMsg(chatWith.contactId, chatWith.contactName)}>Send</button>
                  </div>
                </>}
            </div>
          </div>
        </>}

      </div>
      <Chatbot />
    </div>
  );
}