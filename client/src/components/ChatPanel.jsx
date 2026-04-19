import { useState, useRef, useEffect } from "react";

export function ChatPanel({ messages, onSend, currentUsername }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-title">Chat</span>
        <span className="chat-count">{messages.length}</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">No messages yet. Say hi! 👋</div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.username === currentUsername;
          return (
            <div key={i} className={`message ${isMe ? "message-me" : "message-them"}`}>
              {!isMe && <span className="message-author">{msg.username}</span>}
              <div className="message-bubble">{msg.message}</div>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          maxLength={500}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
