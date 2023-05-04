import Piece, { PieceColor } from "./Piece";
import ChessBoard from "../ChessBoard";
import Move from "../Move";

export default class Rook implements Piece {
    readonly character: string = "R";
    color: PieceColor;
    column: number;
    row: number;

    constructor(color: PieceColor, column: number, row: number) {
        this.column = column;
        this.row = row;
        this.color = color;
    }

    getValidMoves(chessboard: ChessBoard): Move[] {
        let moves: Move[] = [];
        let addMove = (column: number, row: number) => {
            moves.push({
                from: {column: this.column, row: this.row},
                to: {column, row},
                piece: this
            });
        }
        for(let col = this.column + 1;true;col++) {
            if(!chessboard.isValidCoordinate(col, this.row) || chessboard.getPieceAt(col, this.row) == null) {
                break;
            }
            addMove(col, this.row);
        }
        for(let col = this.column - 1;true;col--) {
            if(!chessboard.isValidCoordinate(col, this.row) || chessboard.getPieceAt(col, this.row) == null) {
                break;
            }
            addMove(col, this.row);
        }
        for(let row = this.row + 1;true;row++) {
            if(!chessboard.isValidCoordinate(this.column, row) || chessboard.getPieceAt(this.column, row) == null) {
                break;
            }
            addMove(this.column, row);
        }
        for(let row = this.row - 1;true;row--) {
            if(!chessboard.isValidCoordinate(this.column, row) || chessboard.getPieceAt(this.column, row) == null) {
                break;
            }
            addMove(this.column, row);
        }
        return moves;
    }

    couldGetTo(column: number, row: number): boolean {
        return this.column == column || this.row == row;
    }
}