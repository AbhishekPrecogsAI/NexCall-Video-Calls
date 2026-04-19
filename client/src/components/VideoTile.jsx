import { useEffect, useRef } from "react";

export function VideoTile({ stream, username, muted = false, audioEnabled = true, videoEnabled = true, isLocal = false, isScreenSharing = false }) {
  const videoRef = useRef(null);

  // Re-run whenever stream OR videoEnabled changes
  // When video is toggled back ON, the <video> element remounts — we must
  // re-assign srcObject because the DOM node is brand new each time
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, videoEnabled]);

  const showVideo = videoEnabled && stream;

  return (
    <div className={`video-tile ${isLocal ? "local" : "remote"} ${!showVideo ? "no-video" : ""}`}>
      {/* Always render video, hide with CSS when off — avoids remount srcObject issue */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="video-element"
        style={{ display: showVideo ? "block" : "none" }}
      />

      {/* Avatar shown when no video */}
      {!showVideo && (
        <div className="avatar-fallback">
          <div className="avatar-ring">
            <span className="avatar-initials">
              {username ? username.slice(0, 2).toUpperCase() : "??"}
            </span>
          </div>
        </div>
      )}

      <div className="tile-overlay">
        <div className="tile-info">
          <span className="tile-name">
            {username}{isLocal ? " (You)" : ""}
            {isScreenSharing && <span className="screen-badge"> 🖥 Sharing</span>}
          </span>
          <div className="tile-badges">
            {!audioEnabled && (
              <span className="badge muted-badge" title="Muted"><MicOffIcon /></span>
            )}
            {!videoEnabled && (
              <span className="badge video-off-badge" title="Camera off"><VideoOffIcon /></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MicOffIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function VideoOffIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"/>
      <path d="M23 7l-7 5 7 5V7z"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}