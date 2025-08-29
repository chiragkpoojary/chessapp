import { useEffect, useRef, useState } from "react";
import Board from "./offline.tsx";
import { useGameStore } from "../states/GameId.ts";

export default function OnlineGame({ ws }) {
    const [status, setStatus] = useState("Connecting...");
    const [externalMove, setExternalMove] = useState(null);
    const [players, setPlayers] = useState({ white: false, black: false });
    const [playerColor, setPlayerColor] = useState("");
    const [joinGameId, setJoinGameId] = useState(""); // For typing before joining

    const { gameId, setGameId } = useGameStore();
    const wsRef = useRef(ws);

    useEffect(() => {
        if (!wsRef.current) return;

        wsRef.current.onopen = () => setStatus("Connected");

        wsRef.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
                case "game_created":
                case "game_joined":
                    setGameId(msg.payload.gameId);
                    setPlayerColor(msg.payload.color);
                    break;

                case "game_start":
                    setPlayers({ white: true, black: true });
                    setStatus("Game started!");
                    break;

                case "opponent_move":
                    setExternalMove(msg.payload);
                    break;

                case "player_left":
                    setStatus(
                        `Opponent (${msg.payload.color === "w" ? "White" : "Black"}) left`
                    );
                    setPlayers((prev) => ({
                        ...prev,
                        [msg.payload.color === "w" ? "white" : "black"]: false,
                    }));
                    break;

                case "player_update":
                    setPlayers(msg.payload);
                    break;

                case "error":
                    alert(msg.payload);
                    break;
            }
        };

        return () => wsRef.current.close();
    }, [setGameId]);

    function handleLocalMove(move) {
        wsRef.current.send(
            JSON.stringify({
                type: "move",
                payload: { gameId, move },
            })
        );
    }

    function createGame() {
        wsRef.current.send(JSON.stringify({ type: "create_game" }));
    }

    function joinGame() {
        wsRef.current.send(
            JSON.stringify({
                type: "join_game",
                payload: { gameId: joinGameId },
            })
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            {/* Title */}
            <div className="w-full max-w-2xl mb-6 text-center">
                <h1 className="text-3xl font-bold text-yellow-400">♟ Online Chess</h1>
                <p className="text-lg">
                    Status:{" "}
                    <span className="text-green-400 font-semibold">{status}</span>
                </p>
            </div>

            {/* Player Status */}
            {gameId && (
                <div className="w-full max-w-2xl mb-6 p-4 bg-gray-800 rounded-lg shadow-md flex justify-between items-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-500"></div>
                        <span className="mt-2 font-bold">Player 1</span>
                        <span className="text-sm text-gray-400">White</span>
                        {players.white ? "✅ Joined" : "⏳ Waiting…"}
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-black border border-gray-500"></div>
                        <span className="mt-2 font-bold">Player 2</span>
                        <span className="text-sm text-gray-400">Black</span>
                        {players.black ? "✅ Joined" : "⏳ Waiting…"}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center gap-6">
                {!gameId && (
                    <button
                        onClick={createGame}
                        className="w-full px-8 py-4 bg-green-500 hover:bg-green-600 rounded-lg text-xl font-bold"
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
                        onChange={(e) => setJoinGameId(e.target.value)}
                        value={joinGameId}
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600"
                    />
                    <button
                        onClick={joinGame}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
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
                        playerColor={playerColor}
                        boardOrientation={playerColor === "b" ? "black" : "white"}
                    />
                </div>
            )}
        </div>
    );
}
