import { useState } from "react";
import { Lobby } from "./components/Lobby";
import { Room } from "./components/Room";
import "./index.css";

export default function App() {
  const [session, setSession] = useState(null); // { roomId, username }

  if (!session) {
    return <Lobby onJoin={(s) => setSession(s)} />;
  }

  return (
    <Room
      roomId={session.roomId}
      username={session.username}
      onLeave={() => setSession(null)}
    />
  );
}
