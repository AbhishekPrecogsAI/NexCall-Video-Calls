// import { useState } from "react";
// import { useWebRTC } from "../hooks/useWebRTC";
// import { useChat } from "../hooks/useChat";
// import { VideoTile } from "./VideoTile";
// import { Controls } from "./Controls";
// import { ChatPanel } from "./ChatPanel";

// export function Room({ roomId, username, onLeave }) {
//   const [chatOpen, setChatOpen] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [notification, setNotification] = useState(null);

//   const {
//     localStream,
//     peers,
//     audioEnabled,
//     videoEnabled,
//     isScreenSharing,
//     isConnected,
//     error,
//     leaveRoom,
//     toggleAudio,
//     toggleVideo,
//     toggleScreenShare,
//   } = useWebRTC(roomId, username);

//   // Pass the socket ref down to chat hook via roomId context
//   const { messages, sendMessage } = useChat();

//   const handleLeave = () => {
//     leaveRoom();
//     onLeave();
//   };

//   const copyRoomId = () => {
//     navigator.clipboard.writeText(roomId);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const totalTiles = peers.length + 1;
//   const gridClass =
//     totalTiles === 1 ? "grid-1"
//     : totalTiles === 2 ? "grid-2"
//     : totalTiles === 3 ? "grid-3"
//     : totalTiles <= 4 ? "grid-4"
//     : "grid-many";

//   return (
//     <div className={`room ${chatOpen ? "room--chat-open" : ""}`}>
//       <div className="room-topbar">
//         <div className="room-info">
//           <span className="room-label">Room</span>
//           <button className="room-code" onClick={copyRoomId} title="Copy room code">
//             {roomId}
//             <CopyIcon />
//           </button>
//           {copied && <span className="copied-hint">Copied!</span>}
//           {isScreenSharing && (
//             <span className="sharing-badge">
//               <ScreenDotIcon /> Sharing screen
//             </span>
//           )}
//         </div>

//         <div className="room-status">
//           <span className={`status-dot ${isConnected ? "status-dot--on" : "status-dot--off"}`} />
//           <span className="status-text">
//             {peers.length + 1} participant{peers.length !== 0 ? "s" : ""}
//           </span>
//         </div>
//       </div>

//       {notification && <div className="toast-notification">{notification}</div>}
//       {error && <div className="room-error">{error}</div>}

//       <div className={`video-grid ${gridClass}`}>
//         <VideoTile
//           stream={localStream}
//           username={username}
//           muted={true}
//           audioEnabled={audioEnabled}
//           videoEnabled={videoEnabled}
//           isLocal={true}
//           isScreenSharing={isScreenSharing}
//         />

//         {peers.map((peer) => (
//           <VideoTile
//             key={peer.socketId}
//             stream={peer.stream}
//             username={peer.username}
//             audioEnabled={peer.audioEnabled}
//             videoEnabled={peer.videoEnabled}
//           />
//         ))}

//         {peers.length === 0 && (
//           <div className="waiting-tile">
//             <div className="waiting-inner">
//               <div className="waiting-pulse" />
//               <p className="waiting-text">Waiting for others…</p>
//               <p className="waiting-hint">Share the room code <strong>{roomId}</strong></p>
//             </div>
//           </div>
//         )}
//       </div>

//       <Controls
//         audioEnabled={audioEnabled}
//         videoEnabled={videoEnabled}
//         isScreenSharing={isScreenSharing}
//         onToggleAudio={toggleAudio}
//         onToggleVideo={toggleVideo}
//         onToggleScreen={toggleScreenShare}
//         onLeave={handleLeave}
//         chatOpen={chatOpen}
//         onToggleChat={() => setChatOpen((p) => !p)}
//         participantCount={peers.length + 1}
//       />

//       {chatOpen && (
//         <ChatPanel
//           messages={messages}
//           onSend={sendMessage}
//           currentUsername={username}
//         />
//       )}
//     </div>
//   );
// }

// function CopyIcon() {
//   return (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
//       <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
//     </svg>
//   );
// }

// function ScreenDotIcon() {
//   return (
//     <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
//       <circle cx="12" cy="12" r="6"/>
//     </svg>
//   );
// }





import { useState } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import { useChat } from "../hooks/useChat";
import { VideoTile } from "./VideoTile";
import { Controls } from "./Controls";
import { ChatPanel } from "./ChatPanel";

export function Room({ roomId, username, onLeave }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);
  // spotlightId: null = no spotlight, "local" = local tile, or peer.socketId
  const [spotlightId, setSpotlightId] = useState(null);

  const {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    isConnected,
    error,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC(roomId, username);

  const { messages, sendMessage } = useChat();

  const handleLeave = () => {
    leaveRoom();
    onLeave();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tap a tile: spotlight it. Tap again (or tap another): toggle/switch.
  const handleTileTap = (id) => {
    setSpotlightId((prev) => (prev === id ? null : id));
  };

  const totalTiles = peers.length + 1;
  const gridClass =
    totalTiles === 1 ? "grid-1"
    : totalTiles === 2 ? "grid-2"
    : totalTiles === 3 ? "grid-3"
    : totalTiles <= 4 ? "grid-4"
    : "grid-many";

  return (
    <div className={`room ${chatOpen ? "room--chat-open" : ""}`}>
      <div className="room-topbar">
        <div className="room-info">
          <span className="room-label">Room</span>
          <button className="room-code" onClick={copyRoomId} title="Copy room code">
            {roomId}
            <CopyIcon />
          </button>
          {copied && <span className="copied-hint">Copied!</span>}
          {isScreenSharing && (
            <span className="sharing-badge">
              <ScreenDotIcon /> Sharing screen
            </span>
          )}
        </div>

        <div className="room-status">
          <span className={`status-dot ${isConnected ? "status-dot--on" : "status-dot--off"}`} />
          <span className="status-text">
            {peers.length + 1} participant{peers.length !== 0 ? "s" : ""}
          </span>
        </div>
      </div>

      {notification && <div className="toast-notification">{notification}</div>}
      {error && <div className="room-error">{error}</div>}

      <div className={`video-grid ${gridClass}`}>
        <VideoTile
          stream={localStream}
          username={username}
          muted={true}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          isLocal={true}
          isScreenSharing={isScreenSharing}
          isSpotlight={spotlightId === "local"}
          onTap={() => handleTileTap("local")}
        />

        {peers.map((peer) => (
          <VideoTile
            key={peer.socketId}
            stream={peer.stream}
            username={peer.username}
            audioEnabled={peer.audioEnabled}
            videoEnabled={peer.videoEnabled}
            isSpotlight={spotlightId === peer.socketId}
            onTap={() => handleTileTap(peer.socketId)}
          />
        ))}

        {peers.length === 0 && (
          <div className="waiting-tile">
            <div className="waiting-inner">
              <div className="waiting-pulse" />
              <p className="waiting-text">Waiting for others…</p>
              <p className="waiting-hint">Share the room code <strong>{roomId}</strong></p>
            </div>
          </div>
        )}
      </div>

      <Controls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isScreenSharing={isScreenSharing}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreen={toggleScreenShare}
        onLeave={handleLeave}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen((p) => !p)}
        participantCount={peers.length + 1}
      />

      {chatOpen && (
        <ChatPanel
          messages={messages}
          onSend={sendMessage}
          currentUsername={username}
        />
      )}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function ScreenDotIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="6"/>
    </svg>
  );
}