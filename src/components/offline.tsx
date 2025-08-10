// @ts-ignore
// @ts-ignore

import { Chessboard, type PieceDropHandlerArgs, type SquareHandlerArgs } from "react-chessboard";
import {useEffect, useRef, useState} from "react";
import { Chess, type Square } from "chess.js";

export default function Board({
                                  onMove = () => {},
                                  externalMove = null,
                                  playerColor = '',
                                  boardOrientation = 'white',
                              }: BoardProps = {}){
    const gameRef = useRef(new Chess());
    const chessGame = gameRef.current;
    const [position, setPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const currentTurn = gameRef.current.turn();
    const [lastMoveId, setLastMoveId] = useState(null);

    // 'w' for White, 'b' for Black
const isGameOver=chessGame.isGameOver();
    function getMoveOptions(square: Square) {
        const moves = chessGame.moves({ square, verbose: true });

        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};

        for (const move of moves) {
            newSquares[move.to] = {
                background:
                    chessGame.get(move.to) && chessGame.get(move.to)?.color !== chessGame.get(square)?.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.3) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%',
            };
        }

        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)',
        };

        setOptionSquares(newSquares);

        return true;
    }

    function onSquareClick({ square, piece }: Square) {
        if (playerColor && playerColor !== chessGame.turn()) return false;


        if (!moveFrom && piece) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }

        const moves = chessGame.moves({ square: moveFrom as Square, verbose: true });
        const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

        if (!foundMove) {
            const hasMoveOptions = getMoveOptions(square);
            setMoveFrom(hasMoveOptions ? square : '');
            return;
        }

        try {
           const move= chessGame.move({ from: moveFrom, to: square, promotion: 'q' });
            setPosition(chessGame.fen());

            onMove(move);

            setMoveFrom('');
            setOptionSquares({});
        } catch {
            // invalid move fallback
            const hasMoveOptions = getMoveOptions(square);
            setMoveFrom(hasMoveOptions ? square : '');
        }
    }

    // Handle drag and drop piece moves
    function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
        if (!playerColor) return false;
        if (playerColor !== chessGame.turn()) return;
        if (!targetSquare) return false;

        try {
            const move = chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move === null) return false;
            onMove(move);
            setPosition(chessGame.fen());
            setMoveFrom('');
            setOptionSquares({});
            return true;
        } catch {
            return false;
        }
    }
    let winner;
    if (chessGame.isCheckmate()) {
         winner = chessGame.turn() === 'w' ? 'Palyer2 (Black)' : 'Player1 (White)';

    }




    useEffect(() => {
        if (externalMove) {
            // sanitize move to only pass required fields to chess.js
            console.log(externalMove);
            const move = {
                from: externalMove.move.from,
                to: externalMove.move.to,
                promotion: externalMove.move.promotion || undefined,
            };

            try {
                const result = chessGame.move(move);
                if (result) {
                    setPosition(chessGame.fen());
                    setMoveFrom("");
                    setOptionSquares({});
                } else {
                    console.warn("Invalid opponent move:", move);
                }
            } catch (err) {
                console.error("Opponent move caused error:", err, move);
            }

        }
    }, [externalMove]);








    const chessboardOptions = {
        onPieceDrop,
        onSquareClick,
        boardOrientation: playerColor === 'b' ? 'black' : 'white', // ✅ For react-chessboard
        position,
        squareStyles: optionSquares,
        id: 'click-or-drag-to-move'
    };

    // @ts-ignore
    return (
        <div className="w-[50rem] mx-auto mt-5 p-6 bg-gray-900 rounded-lg shadow-lg text-center cursor-default  text-white">
            {isGameOver ? (
                <div className="mb-6">
                    <div className="text-3xl font-bold text-yellow-400 mb-4 cursor-default"> Winner Is:{winner} </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded transition "
                    >
                        Restart Game
                    </button>
                </div>
            ) : (
                <div className="mb-6 text-xl font-semibold text-white flex items-center justify-center gap-2 cursor-default">
                    <span>Current Turn:</span>
                    <span
                        className={`px-4 py-1 rounded font-bold ${
                            currentTurn === 'w' ? 'bg-white text-black' : 'bg-black text-white border border-white'
                        }`}
                    >
        {currentTurn === 'w' ? 'WHITE' : 'BLACK'}
      </span>
                </div>
            )}
            <div className="mt-8 p-4 bg-gray-800 rounded-lg shadow-lg">
            <Chessboard options={chessboardOptions} />
                </div>
        </div>

    );
}
