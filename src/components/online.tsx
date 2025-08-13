import {useEffect, useRef, useState} from "react";
import Board from "./offline.tsx";

export default function OnlineGame({ws}) {
    const [gameId, setGameId] = useState(null);
    const [status, setStatus] = useState('Connecting...');
    const [externalMove, setExternalMove] = useState(null);
    const [players, setPlayers] = useState({ white: false, black: false });
const [playercolor, setPlayercolor] = useState("");


   // const ws = new WebSocket(import.meta.env.PUBLIC_VITE_WS_URL);

    const wsRef = useRef(ws);

  const [gameIdInput, setGameIdInput] = useState("");

    useEffect(() => {
        ws.onopen = () => setStatus('Connected');
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case 'game_created':
                case 'game_joined':
                    setGameId(msg.payload.gameId);
                    setPlayercolor(msg.payload.color);
                    setPlayers((prev) => ({ ...prev, white: true }));
                    break;
                case 'game_start':
                    setGameId(msg.payload.gameId);
                    setPlayers({ white: true, black: true });
                    setStatus('Game started!');
                    break;
                case 'opponent_move':
                    setExternalMove(msg.payload);
                    break;
                case 'player_left':
                    setStatus(`Opponent (${msg.payload.color === 'w' ? 'White' : 'Black'}) left the game`);
                    setPlayers((prev) => ({
                        ...prev,
                        [msg.payload.color === 'w' ? 'white' : 'black']: false
                    }));

                    break;
                case 'player_update':
                    setPlayers(msg.payload); // { white: true/false, black: true/false }
                    break;

                case 'error':
                    alert(msg.payload);
                    break;
            }
        };


        return () => ws.close();
    }, []);

    function handleLocalMove(move) {
console.log('online', move);
            wsRef.current.send(JSON.stringify({
                type: 'move',
                payload: {
                    gameId,
                    move
                }
            }));



    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            {/* Title */}
            <div className="w-full max-w-2xl mb-6 text-center">
                <h1 className="text-3xl font-bold text-yellow-400">♟ Online Chess</h1>
                <p className="text-lg">
                    Status: <span className="text-green-400 font-semibold">{status}</span>
                </p>
            </div>

            {/* Players Status */}
            {gameId && (
                <div className="w-full max-w-2xl mb-6 p-4 bg-gray-800 rounded-lg shadow-md flex justify-between items-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-500"></div>
                        <span className="mt-2 font-bold text-white">Player 1</span>
                        <span className="text-sm text-gray-400">White</span>
                        {players.white ? (
                            <span className="text-green-400 text-sm">✅ Joined</span>
                        ) : (
                            <span className="text-red-400 text-sm">⏳ Waiting…</span>
                        )}
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-black border border-gray-500"></div>
                        <span className="mt-2 font-bold text-white">Player 2</span>
                        <span className="text-sm text-gray-400">Black</span>
                        {players.black ? (
                            <span className="text-green-400 text-sm">✅ Joined</span>
                        ) : (
                            <span className="text-red-400 text-sm">⏳ Waiting…</span>
                        )}
                    </div>
                </div>
            )}

            {/* Lobby Controls */}
            <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center gap-6">
                {!gameId && (
                    <button
                        onClick={() =>
                            wsRef.current.send(JSON.stringify({ type: "create_game" }))
                        }
                        className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 rounded-lg text-xl font-bold shadow-md transition"

                    >
                        Create Game
                    </button>
                )}

                {gameId && (
                    <div className="w-full p-4 bg-gray-700 rounded-lg text-center">
                        <p className="font-bold text-lg">
                            Game ID:{" "}
                            <span className="text-yellow-300 font-mono">{gameId}</span>
                        </p>
                        <p className="text-gray-400 text-sm">
                            Share this ID with your opponent
                        </p>
                    </div>
                )}

                <div className="flex w-full gap-2">
                    <input
                        type="text"
                        placeholder="Enter Game ID"
                        onChange={(e) => setGameIdInput(e.target.value)}
                        value={gameIdInput}
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={() =>
                            wsRef.current.send(
                                JSON.stringify({
                                    type: "join_game",
                                    payload: { gameIdInput, color: "b" },
                                })
                            )
                        }
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold shadow-md transition"
                    >
                        Join
                    </button>
                </div>
            </div>

            {/* Chess Board */}
            {gameId && (
                <div className="mt-8 p-4 bg-gray-800 rounded-lg shadow-lg">
                    <Board
                        onMove={handleLocalMove}
                        externalMove={externalMove}
                        playerColor={playercolor}
                        boardOrientation={playercolor === "b" ? "black" : "white"}
                    />
                </div>
            )}
        </div>

    );
}
