const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// In-memory store
const rooms = new Map(); // roomId -> { users: Map<socketId, { username, socketId }> }

// ─── REST: Create or Get Room ────────────────────────────────────────────────
app.post("/api/rooms", (req, res) => {
  const roomId = uuidv4().slice(0, 8).toUpperCase();
  rooms.set(roomId, { users: new Map() });
  res.json({ roomId });
});

app.get("/api/rooms/:roomId", (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({
    roomId: req.params.roomId,
    userCount: room.users.size,
    users: Array.from(room.users.values()),
  });
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ─── Socket.io Signaling ─────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // JOIN ROOM
  socket.on("join-room", ({ roomId, username }) => {
    let room = rooms.get(roomId);
    if (!room) {
      room = { users: new Map() };
      rooms.set(roomId, room);
    }

    // Get existing users before adding new one
    const existingUsers = Array.from(room.users.values());

    // Add user to room
    room.users.set(socket.id, { username, socketId: socket.id });
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    console.log(`[JOIN] ${username} (${socket.id}) joined room ${roomId}`);

    // Tell the new user who's already in the room
    socket.emit("room-joined", {
      roomId,
      existingUsers,
      username,
    });

    // Tell existing users about the new peer
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      username,
    });

    // Broadcast updated user list
    io.to(roomId).emit("room-users", {
      users: Array.from(room.users.values()),
    });
  });

  // WebRTC OFFER
  socket.on("offer", ({ to, offer }) => {
    console.log(`[OFFER] ${socket.id} -> ${to}`);
    io.to(to).emit("offer", {
      from: socket.id,
      username: socket.data.username,
      offer,
    });
  });

  // WebRTC ANSWER
  socket.on("answer", ({ to, answer }) => {
    console.log(`[ANSWER] ${socket.id} -> ${to}`);
    io.to(to).emit("answer", {
      from: socket.id,
      answer,
    });
  });

  // ICE CANDIDATE
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", {
      from: socket.id,
      candidate,
    });
  });

  // TOGGLE MEDIA
  socket.on("media-toggle", ({ type, enabled }) => {
    const { roomId, username } = socket.data;
    if (!roomId) return;
    socket.to(roomId).emit("peer-media-toggle", {
      socketId: socket.id,
      username,
      type,
      enabled,
    });
  });

  // CHAT MESSAGE
  socket.on("chat-message", ({ message }) => {
    const { roomId, username } = socket.data;
    if (!roomId) return;
    const payload = {
      from: socket.id,
      username,
      message,
      timestamp: new Date().toISOString(),
    };
    io.to(roomId).emit("chat-message", payload);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const { roomId, username } = socket.data;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);

      socket.to(roomId).emit("user-left", {
        socketId: socket.id,
        username,
      });

      io.to(roomId).emit("room-users", {
        users: Array.from(room.users.values()),
      });

      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`[ROOM] Room ${roomId} deleted (empty)`);
      }
    }

    console.log(`[-] ${username || socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on http://localhost:${PORT}`);
});
