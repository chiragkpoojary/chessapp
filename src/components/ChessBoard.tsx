import { Chessboard } from "react-chessboard";
import "../styles/global.css";
import { useRef, useState } from "react";
import { Chess, type Square } from "chess.js";

export default function Board() {
    const chessRef = useRef(new Chess());
    const chess = chessRef.current;

    const [chessPosition, setChessPosition] = useState(chess.fen());
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    function getMoveOptions(square: Square) {
        const moves = chess.moves({ square, verbose: true });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: Record<string, React.CSSProperties> = {};

        for (const move of moves) {
            newSquares[move.to] = {
                background: chess.get(move.to)
                    ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
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

    function onSquareClick(square: Square) {
        if (!moveFrom) {
            const hasMoves = getMoveOptions(square);
            if (hasMoves) setMoveFrom(square);
            return;
        }

        const moves = chess.moves({ square: moveFrom as Square, verbose: true });
        const foundMove = moves.find((m) => m.to === square);

        if (!foundMove) {
            const hasMoves = getMoveOptions(square);
            setMoveFrom(hasMoves ? square : '');
            return;
        }

        chess.move({ from: moveFrom, to: square, promotion: "q" }); // Always promote to queen
        setChessPosition(chess.fen());
        setMoveFrom('');
        setOptionSquares({});
    }

    return (
        <div className="w-[50rem] mx-auto h-[50rem] mt-28">
            <Chessboard
                position={chessPosition}
                onSquareClick={onSquareClick}
                customSquareStyles={optionSquares}
                boardWidth={800}
                id="click-to-move"
            />
        </div>
    );
}
