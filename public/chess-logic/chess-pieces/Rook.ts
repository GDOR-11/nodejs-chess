import ChessBoard from "../ChessBoard";
import Coordinate from "../Coordinate";
import Move from "../Move";
import Piece from "./Piece";

export default class Rook extends Piece {
    readonly character: string = "R";
    getValidMoves(board: ChessBoard): Move[] {
        let moves: Move[] = [];
        for(let col = this.position.column + 1;col < 8;col++) {
            if(board[col][this.position.row] == undefined) {
                moves.push(new Move(this.position, new Coordinate(col, this.position.row)));
            } else {
                break;
            }
        }
        for(let col = this.position.column - 1;col > 0;col--) {
            if(board[col][this.position.row] == undefined) {
                moves.push(new Move(this.position, new Coordinate(col, this.position.row)));
            }
        }
        for(let col = this.position.column + 1;col < 8;col++) {
            if(board[col][this.position.row] == undefined) {
                moves.push(new Move(this.position, new Coordinate(col, this.position.row)));
            }
        }
        for(let col = this.position.column + 1;col < 8;col++) {
            if(board[col][this.position.row] == undefined) {
                moves.push(new Move(this.position, new Coordinate(col, this.position.row)));
            }
        }
        return moves;
    }
}