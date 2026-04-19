export function Controls({
  audioEnabled, videoEnabled, isScreenSharing,
  onToggleAudio, onToggleVideo, onToggleScreen, onLeave,
  chatOpen, onToggleChat, participantCount,
}) {
  return (
    <div className="controls-bar">
      <div className="controls-group">
        <button
          className={`ctrl-btn ${!audioEnabled ? "ctrl-btn--off" : ""}`}
          onClick={onToggleAudio}
          title={audioEnabled ? "Mute" : "Unmute"}
        >
          {audioEnabled ? <MicIcon /> : <MicOffIcon />}
          <span className="ctrl-label">{audioEnabled ? "Mute" : "Unmute"}</span>
        </button>

        <button
          className={`ctrl-btn ${!videoEnabled ? "ctrl-btn--off" : ""}`}
          onClick={onToggleVideo}
          title={videoEnabled ? "Stop Video" : "Start Video"}
        >
          {videoEnabled ? <VideoIcon /> : <VideoOffIcon />}
          <span className="ctrl-label">{videoEnabled ? "Camera" : "No Cam"}</span>
        </button>

        <button
          className={`ctrl-btn ${isScreenSharing ? "ctrl-btn--active" : ""}`}
          onClick={onToggleScreen}
          title={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          <ScreenIcon />
          <span className="ctrl-label">{isScreenSharing ? "Stop Share" : "Share"}</span>
        </button>
      </div>

      <div className="controls-group">
        <button
          className={`ctrl-btn ${chatOpen ? "ctrl-btn--active" : ""}`}
          onClick={onToggleChat}
          title="Toggle Chat"
        >
          <ChatIcon />
          <span className="ctrl-label">Chat</span>
        </button>

        <div className="ctrl-participants">
          <PeopleIcon />
          <span>{participantCount}</span>
        </div>
      </div>

      <div className="controls-group">
        <button className="ctrl-btn ctrl-btn--leave" onClick={onLeave} title="Leave call">
          <PhoneOffIcon />
          <span className="ctrl-label">Leave</span>
        </button>
      </div>
    </div>
  );
}

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const VideoOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"/>
    <path d="M23 7l-7 5 7 5V7z"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ScreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const PeopleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/>
    <path d="M14.5 14.5L9 9m0 0A19.79 19.79 0 0 1 3.07 2.41 2 2 0 0 1 5 .25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9 9z"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
