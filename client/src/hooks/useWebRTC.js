import { useEffect, useRef, useCallback, useState } from "react";
import { createSocket } from "../socket";
import { registerChatSocket } from "./useChat";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTC(roomId, username) {
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // socketId -> RTCPeerConnection
  // Source of truth for peer metadata (username etc) — separate from React state
  const peerMetaRef = useRef({});        // socketId -> { username }

  const [peers, setPeers] = useState([]); // [{ socketId, username, stream, audioEnabled, videoEnabled }]
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // ── Peer state helpers (always operate on socketId as key) ────────────────

  const upsertPeer = useCallback((socketId, updates) => {
    setPeers((prev) => {
      const idx = prev.findIndex((p) => p.socketId === socketId);
      if (idx >= 0) {
        // update existing
        const next = [...prev];
        next[idx] = { ...next[idx], ...updates };
        return next;
      }
      // insert new — pull username from metaRef if not provided
      const meta = peerMetaRef.current[socketId] || {};
      return [...prev, {
        socketId,
        username: updates.username ?? meta.username ?? "Unknown",
        stream: null,
        audioEnabled: true,
        videoEnabled: true,
        ...updates,
      }];
    });
  }, []);

  const removePeer = useCallback((socketId) => {
    const pc = peerConnectionsRef.current[socketId];
    if (pc) { pc.close(); delete peerConnectionsRef.current[socketId]; }
    delete peerMetaRef.current[socketId];
    setPeers((prev) => prev.filter((p) => p.socketId !== socketId));
  }, []);

  // ── Create RTCPeerConnection ──────────────────────────────────────────────

  const createPeerConnection = useCallback((socketId, peerUsername) => {
    // Close stale PC if any
    if (peerConnectionsRef.current[socketId]) {
      peerConnectionsRef.current[socketId].close();
    }

    peerMetaRef.current[socketId] = { username: peerUsername };

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[socketId] = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socketRef.current?.connected) {
        socketRef.current.emit("ice-candidate", { to: socketId, candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[PC:${socketId.slice(0,6)}] ${pc.connectionState}`);
      if (pc.connectionState === "failed") removePeer(socketId);
    };

    // When remote tracks arrive — update the stream on existing peer entry
    pc.ontrack = ({ streams }) => {
      const remoteStream = streams[0];
      if (!remoteStream) return;
      console.log(`[TRACK] from ${socketId.slice(0,6)}, tracks: ${remoteStream.getTracks().length}`);
      // upsertPeer will update stream on existing entry OR create if missing
      upsertPeer(socketId, { stream: remoteStream });
    };

    return pc;
  }, [removePeer, upsertPeer]);

  // ── Init local media ──────────────────────────────────────────────────────

  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setVideoEnabled(false);
        return stream;
      } catch (e) {
        setError("Camera/mic access denied: " + e.message);
        return null;
      }
    }
  }, []);

  // ── Join ──────────────────────────────────────────────────────────────────

  const joinRoom = useCallback(async () => {
    await initMedia();

    const socket = createSocket();
    socketRef.current = socket;
    registerChatSocket(socket);

    socket.on("connect", () => {
      console.log(`[SOCKET] connected: ${socket.id}`);
      setIsConnected(true);
      socket.emit("join-room", { roomId, username });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] disconnected: ${reason}`);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      setError("Cannot connect to server: " + err.message);
    });

    // We joined — create offers to everyone already in the room
    socket.on("room-joined", async ({ existingUsers }) => {
      console.log(`[ROOM-JOINED] existing:`, existingUsers.map(u => u.username));
      for (const user of existingUsers) {
        // Register metadata FIRST so upsertPeer knows the username
        peerMetaRef.current[user.socketId] = { username: user.username };
        // Add peer entry with stream: null (will update when track arrives)
        upsertPeer(user.socketId, { username: user.username, stream: null });
        const pc = createPeerConnection(user.socketId, user.username);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: user.socketId, offer });
          console.log(`[OFFER] sent to ${user.username}`);
        } catch (e) {
          console.error("[OFFER] failed:", e);
        }
      }
    });

    // A new user joined — pre-register so we're ready for their offer
    socket.on("user-joined", ({ socketId: peerId, username: peerUsername }) => {
      console.log(`[USER-JOINED] ${peerUsername}`);
      peerMetaRef.current[peerId] = { username: peerUsername };
      // Add optimistic entry; stream comes via ontrack
      upsertPeer(peerId, { username: peerUsername, stream: null });
      createPeerConnection(peerId, peerUsername);
    });

    // Received offer → answer
    socket.on("offer", async ({ from, username: peerUsername, offer }) => {
      console.log(`[OFFER-RX] from ${peerUsername}`);
      peerMetaRef.current[from] = { username: peerUsername };
      let pc = peerConnectionsRef.current[from];
      if (!pc) pc = createPeerConnection(from, peerUsername);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, answer });
      } catch (e) {
        console.error("[ANSWER] failed:", e);
      }
    });

    // Received answer
    socket.on("answer", async ({ from, answer }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error("[ANSWER-RX] setRemoteDescription failed:", e);
        }
      }
    });

    // ICE candidate
    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("[ICE] warn:", e.message);
        }
      }
    });

    socket.on("user-left", ({ socketId: peerId }) => {
      console.log(`[USER-LEFT] ${peerId.slice(0,6)}`);
      removePeer(peerId);
    });

    socket.on("peer-media-toggle", ({ socketId: peerId, type, enabled }) => {
      upsertPeer(peerId, {
        [type === "audio" ? "audioEnabled" : "videoEnabled"]: enabled,
      });
    });

    socket.connect();
  }, [roomId, username, initMedia, createPeerConnection, upsertPeer, removePeer]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  const leaveRoom = useCallback(() => {
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};
    peerMetaRef.current = {};

    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    socketRef.current?.disconnect();
    socketRef.current = null;

    setLocalStream(null);
    setPeers([]);
    setIsConnected(false);
    setIsScreenSharing(false);
  }, []);

  // ── Toggles ───────────────────────────────────────────────────────────────

  const toggleAudio = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
      socketRef.current?.emit("media-toggle", { type: "audio", enabled: track.enabled });
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
      socketRef.current?.emit("media-toggle", { type: "video", enabled: track.enabled });
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          pc.getSenders().find((s) => s.track?.kind === "video")?.replaceTrack(cameraTrack);
        });
        setLocalStream(localStreamRef.current);
      }
      setIsScreenSharing(false);
      socketRef.current?.emit("media-toggle", { type: "screen", enabled: false });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          pc.getSenders().find((s) => s.track?.kind === "video")?.replaceTrack(screenTrack);
        });
        const preview = new MediaStream([screenTrack, ...(localStreamRef.current?.getAudioTracks() || [])]);
        setLocalStream(preview);
        setIsScreenSharing(true);
        socketRef.current?.emit("media-toggle", { type: "screen", enabled: true });
        screenTrack.onended = () => toggleScreenShare();
      } catch (e) {
        if (e.name !== "NotAllowedError") setError("Screen share failed: " + e.message);
      }
    }
  }, [isScreenSharing]);

  // ── Mount once ────────────────────────────────────────────────────────────

  useEffect(() => {
    joinRoom();
    return () => leaveRoom();
  }, []); // eslint-disable-line

  return {
    localStream, peers, audioEnabled, videoEnabled,
    isScreenSharing, isConnected, error,
    leaveRoom, toggleAudio, toggleVideo, toggleScreenShare,
  };
}
