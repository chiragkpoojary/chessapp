import { useEffect, useRef, useState } from "react";

export default function VideoCall({ ws, gameId }) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(new RTCPeerConnection());
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    console.log(gameId)
    useEffect(() => {

        if (!ws) return;
        if (!gameId) return;


        ws.addEventListener("message", async (event) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case "webrtc_offer":
                    await handleOffer(msg.payload);
                    break;
                case "webrtc_answer":
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.payload.sdp));
                    break;
                case "webrtc_ice":
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.payload.candidate));
                    break;
                default:
                    break;
            }
        });

        // Handle incoming tracks
        pcRef.current.ontrack = event => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        pcRef.current.onicecandidate = event => {
            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: "webrtc_ice",
                    payload: { gameId, candidate: event.candidate }
                }));
            }
        };

    }, [ws, gameId]);

    async function startVideo() {
        try {
            if (!gameId) return;
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));

           
            if (!pcRef.current.localDescription) {
                const offer = await pcRef.current.createOffer();
                await pcRef.current.setLocalDescription(offer);
                ws.send(JSON.stringify({
                    type: "webrtc_offer",
                    payload: { gameId, sdp: offer }
                }));
            }

        } catch (err) {
            console.error("❌ Error accessing camera:", err);
        }
    }

    async function handleOffer(offerData) {
        if (!gameId) return;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offerData.sdp));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        ws.send(JSON.stringify({
            type: "webrtc_answer",
            payload: { gameId, sdp: answer }
        }));
    }

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg flex-col absolute top-[45rem] gap-4">
            <div className="flex-col space-y-16">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-48 h-36 bg-black rounded" />
                <video ref={remoteVideoRef} autoPlay playsInline className="w-48 h-36 bg-black rounded" />
            </div>
            <div className="flex flex-col space-y-6 mt-7">
                <button
                    onClick={startVideo}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Start Video
                </button>
            </div>
        </div>
    );
}
