import Piece from "./chess-pieces/Piece";

// should ChessBoard be a class, a type or an interface?

// btw making it fixed size doesn't seem very right, i'll guess the constructor (if any) should specify the size or something like that
/* *looks* like ChessBoard should be a class */

export type ChessBoardRow = [Piece| undefined, Piece | undefined, Piece | undefined, Piece | undefined, Piece | undefined, Piece | undefined, Piece | undefined, Piece | undefined, Piece | undefined];

// for some reason "export default type ChessBoard = ..." doesn't work, so i had to separate the default export from the definition
type ChessBoard = [ChessBoardRow, ChessBoardRow, ChessBoardRow, ChessBoardRow, ChessBoardRow, ChessBoardRow, ChessBoardRow, ChessBoardRow, ChessBoardRow];
export default ChessBoard;