# NexCall — WebRTC Video Call App

Full-stack real-time video/audio call app using **WebRTC**, **Socket.io**, **Express**, and **React**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser A                           │
│   React + useWebRTC hook                                    │
│   RTCPeerConnection ──────────────────────────────────────┐ │
└────────────────────────────┬────────────────────────────── │ ┘
                             │ Socket.io (Signaling)          │
                    ┌────────▼────────┐                      │
                    │  Express Server │                      │
                    │  Socket.io      │  WebRTC P2P Media ◄──┘
                    │  Signaling      │  (direct, no server)
                    └────────┬────────┘
                             │ Socket.io (Signaling)
┌────────────────────────────▼────────────────────────────────┐
│                         Browser B                           │
│   React + useWebRTC hook                                    │
│   RTCPeerConnection                                         │
└─────────────────────────────────────────────────────────────┘
```

**Key flows:**
- **Signaling**: offer/answer/ICE candidates go via Socket.io server
- **Media**: audio/video streams flow P2P directly via WebRTC
- **Chat**: real-time messages via Socket.io (broadcast to room)

## Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express, Socket.io |
| Frontend | React 18, Vite |
| Real-time | WebRTC (RTCPeerConnection), Socket.io |
| Styling | Pure CSS (dark glassmorphism) |

## Setup & Run

### 1. Server
```bash
cd server
npm install
npm run dev        # nodemon, hot-reload
# OR
npm start          # production
```
Server runs at **http://localhost:4000**

### 2. Client
```bash
cd client
npm install
npm run dev
```
Client runs at **http://localhost:5173**

### 3. Test multi-user
Open **two browser tabs** (or different browsers) at `http://localhost:5173`

1. Tab 1: Enter name → "Create & Join"
2. Copy the 8-char room code
3. Tab 2: Enter name → "Join Room" → paste code

Both users should see each other's video!

## Features

- 🎥 HD video (1280×720) + audio with echo cancellation
- 🔄 Multi-peer mesh topology (each peer connects to every other)
- 🎙️ Toggle audio/video mid-call (peers see your status)
- 💬 In-room text chat via Socket.io
- 📋 One-click room code copy
- 🎭 Avatar fallback when camera is off
- ⚡ Auto-reconnect handling

## File Structure

```
webrtc-app/
├── server/
│   ├── index.js          # Express + Socket.io signaling server
│   └── package.json
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Root — Lobby or Room
        ├── index.css          # All styles
        ├── socket.js          # Singleton socket instance
        ├── hooks/
        │   ├── useWebRTC.js   # RTCPeerConnection logic, media
        │   └── useChat.js     # Chat messages
        └── components/
            ├── Lobby.jsx      # Create/join screen
            ├── Room.jsx       # Call screen + video grid
            ├── VideoTile.jsx  # Individual video/avatar tile
            ├── Controls.jsx   # Mic/cam/chat/leave buttons
            └── ChatPanel.jsx  # Slide-in chat sidebar
```

## WebRTC Signaling Flow

```
User A joins room
  └─> socket: "join-room"
      └─> server sends: "room-joined" { existingUsers: [] }

User B joins room
  └─> socket: "join-room"
      └─> server sends to B: "room-joined" { existingUsers: [A] }
      └─> server sends to A: "user-joined" { socketId: B }

B creates offer to A:
  B: RTCPeerConnection.createOffer()
  B: socket.emit("offer", { to: A, offer })
  A: receives offer, creates answer
  A: socket.emit("answer", { to: B, answer })
  B: setRemoteDescription(answer)

Both sides exchange ICE candidates via:
  socket.emit("ice-candidate", { to, candidate })
  
Media flows P2P via STUN (Google STUN servers)
```
