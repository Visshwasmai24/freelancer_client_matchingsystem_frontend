import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const QUICK_QUESTIONS = [
  "How do I submit a proposal?",
  "How does matching work?",
  "How to upload resume?",
  "How to post a project?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! 👋 I'm your platform assistant. Ask me anything about finding freelancers, posting projects, proposals, or how the platform works!", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgEndRef = useRef(null);

  useEffect(() => {
    if (open) msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { text: msg, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chatbot/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply || "Sorry, I couldn't get a response.", sender: "bot" }]);
    } catch {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting. Please try again shortly.",
        sender: "bot"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="AI Assistant">
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <div className="chat-widget-title">
              <span className="chat-bot-icon">🤖</span>
              <div>
                <div className="chat-bot-name">Platform Assistant</div>
                <div className="chat-bot-status">● Online</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-widget-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.sender}`}>
                {m.sender === "bot" && <span className="bot-avatar">🤖</span>}
                <div className="chat-msg-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <span className="bot-avatar">🤖</span>
                <div className="chat-msg-bubble">
                  <div className="typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          <div className="quick-questions">
            <div className="quick-label">Quick questions:</div>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          <div className="chat-widget-input">
            <textarea
              rows={1}
              value={input}
              placeholder="Ask anything about the platform..."
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
            />
            <button className="chat-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
