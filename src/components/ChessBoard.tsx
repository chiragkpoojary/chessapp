import { Chessboard, type PieceDropHandlerArgs, type SquareHandlerArgs } from "react-chessboard";
import { useRef, useState } from "react";
import { Chess, type Square } from "chess.js";

export default function Board() {
    const gameRef = useRef(new Chess());
    const chessGame = gameRef.current;

    const [position, setPosition] = useState(chessGame.fen());
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const currentTurn = gameRef.current.turn(); // 'w' for White, 'b' for Black
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

    function onSquareClick({ square, piece }: SquareHandlerArgs) {
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
            chessGame.move({ from: moveFrom, to: square, promotion: 'q' });
            setPosition(chessGame.fen());
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
        if (!targetSquare) return false;

        try {
            const move = chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move === null) return false;

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
         winner = chessGame.turn() === 'w' ? 'Black' : 'White';

    }

    const chessboardOptions = {
        onPieceDrop,
        onSquareClick,

        position: position,
        squareStyles: optionSquares,
        id: 'click-or-drag-to-move'
    };
    return (
        <div className="w-[50rem] mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-lg text-center">
            {isGameOver ? (
                <div className="mb-6">
                    <div className="text-3xl font-bold text-yellow-400 mb-4">🎉🎊 congratulations:{winner} 🎊🎉</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded transition"
                    >
                        Restart Game
                    </button>
                </div>
            ) : (
                <div className="mb-6 text-xl font-semibold text-white flex items-center justify-center gap-2">
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

            <Chessboard options={chessboardOptions} />
        </div>

    );
}
