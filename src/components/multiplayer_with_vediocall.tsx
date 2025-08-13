// multiplayer_with_vediocall.jsx
import { useEffect, useState } from "react";
import OnlineGame from "./online.tsx";
import VideoCall from "../components/vediocall.tsx";

export default function MultiplayerWithVideoCall() {
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const socket = new WebSocket(import.meta.env.PUBLIC_VITE_WS_URL);

        socket.onopen = () => {
            console.log("✅ WebSocket connected");
        };

        socket.onclose = () => {
            console.log("❌ WebSocket disconnected");
        };

        setWs(socket);

        return () => socket.close();
    }, []);

    if (!ws) {
        return <div>Connecting...</div>; // prevents child errors
    }

    return (
        <div>
            <OnlineGame ws={ws} />
            <VideoCall ws={ws} /> {/* Same socket for both */}
        </div>
    );
}
