import ChessBoard from "../ChessBoard";
import Move from "../Move";

export enum PieceColor {
    White = "white",
    Black = "black"
}

export default interface Piece {
    readonly character: string;
    color: PieceColor;
    column: number;
    row: number;

    /**
     * returns the valid moves that the piece can make
     * @param pieceAt returns the piece at column and row. Should return null when there is no piece
     * and undefined when the coordinate does not exist (e.g. col 3 row 8 in a default chessboard)
     */
    getValidMoves(chessboard: ChessBoard): Move[];

    /** returns true if the piece, within one move, could get to (column, row) if completely unblocked by other pieces and the shape of the board */
    couldGetTo(column: number, row: number): boolean;
}