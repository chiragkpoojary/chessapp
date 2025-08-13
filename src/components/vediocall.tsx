import { useEffect, useRef, useState } from "react";

export default function VideoCall({ws}) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    //const ws = new WebSocket(import.meta.env.PUBLIC_VITE_WS_URL);
    useEffect(() => {
        if (!ws) return;

        ws.addEventListener("message", async (event) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case "game_joined":
                    console.log("🎯 Player joined, starting video call...");
                    await startVideo();
                    await callOpponent(); // automatically send offer
                    break;

                case "webrtc-offer":
                    await handleOffer(msg.payload);
                    break;
                case "webrtc-answer":
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload));
                    break;
                case "webrtc-ice":
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.payload));
                    break;
            }
        });
    }, [ws]);


    async function startVideo() {
        try {
            console.log("Starting video");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    }

    async function callOpponent() {
        console.log("oponents");
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "webrtc-offer", payload: offer }));
    }

    async function handleOffer(offer) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "webrtc-answer", payload: answer }));
    }

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg flex-col justify-center items-end  absolute top-[45rem] gap-4">

            <div className="flex-col space-y-16">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-48 h-36 bg-black rounded" />
                <video ref={remoteVideoRef} autoPlay playsInline className="w-48 h-36 bg-black rounded" />
            </div>
            <button onClick={startVideo} className="px-4 py-2 bg-blue-500 rounded mt-7">
                Start Camera
            </button>
        </div>
    );
}
