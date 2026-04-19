import { useState } from "react";

export function Lobby({ onJoin }) {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("create"); // "create" | "join"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createRoom = async () => {
    if (!username.trim()) return setError("Enter your name first");
    setLoading(true);
    try {
      const res = await fetch("/api/rooms", { method: "POST" });
      const data = await res.json();
      onJoin({ roomId: data.roomId, username: username.trim() });
    } catch {
      setError("Failed to create room. Is the server running?");
    }
    setLoading(false);
  };

  const joinRoom = () => {
    if (!username.trim()) return setError("Enter your name");
    if (!roomId.trim()) return setError("Enter a room code");
    onJoin({ roomId: roomId.trim().toUpperCase(), username: username.trim() });
  };

  return (
    <div className="lobby">
      <div className="lobby-card">
        <div className="lobby-brand">
          <div className="brand-icon">
            <WaveIcon />
          </div>
          <h1 className="brand-name">NexCall</h1>
          <p className="brand-tagline">Crystal-clear video calls, zero friction</p>
        </div>

        <div className="lobby-form">
          <div className="input-group">
            <label className="input-label">Your Name</label>
            <input
              className="lobby-input"
              placeholder="e.g. Abhi"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              maxLength={30}
            />
          </div>

          <div className="tab-row">
            <button
              className={`tab-btn ${mode === "create" ? "tab-btn--active" : ""}`}
              onClick={() => setMode("create")}
            >
              Create Room
            </button>
            <button
              className={`tab-btn ${mode === "join" ? "tab-btn--active" : ""}`}
              onClick={() => setMode("join")}
            >
              Join Room
            </button>
          </div>

          {mode === "join" && (
            <div className="input-group">
              <label className="input-label">Room Code</label>
              <input
                className="lobby-input lobby-input--code"
                placeholder="e.g. A1B2C3D4"
                value={roomId}
                onChange={(e) => { setRoomId(e.target.value.toUpperCase()); setError(""); }}
                maxLength={8}
              />
            </div>
          )}

          {error && <p className="lobby-error">{error}</p>}

          <button
            className="lobby-btn"
            onClick={mode === "create" ? createRoom : joinRoom}
            disabled={loading}
          >
            {loading ? "Creating…" : mode === "create" ? "Create & Join" : "Join Room"}
          </button>
        </div>

        <div className="lobby-features">
          <span>🎥 HD Video</span>
          <span>🎤 Crystal Audio</span>
          <span>💬 Live Chat</span>
          <span>🔒 P2P Encrypted</span>
        </div>
      </div>
    </div>
  );
}

function WaveIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="url(#g1)"/>
      <path d="M8 16 Q12 10 16 16 Q20 22 24 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
