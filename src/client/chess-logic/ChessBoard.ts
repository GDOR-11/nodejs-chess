import Move from "./Move";
import Piece from "./chess-pieces/Piece";


export default interface ChessBoard {
    /** returns wether the coordinates are valid or not (e.g. in a normal chessboard, e4 is valid, while f9 is not) */
    isValidCoordinate(column: number, row: number): boolean;

    /** returns the piece at column and row. If there is no piece at that location (or if that location isn't valid), it returns null */
    getPieceAt(column: number, row: number): Piece | null;

    /** sets the piece at column and row to the specified piece (if these coordinates are valid) */
    setPieceAt(column: number, row: number, piece: Piece): void;
}