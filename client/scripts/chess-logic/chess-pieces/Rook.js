export default class Rook {
    constructor(color, column, row) {
        this.character = "R";
        this.column = column;
        this.row = row;
        this.color = color;
    }
    getValidMoves(chessboard) {
        let moves = [];
        let addMove = (column, row) => {
            moves.push({
                from: { column: this.column, row: this.row },
                to: { column, row },
                piece: this
            });
        };
        for (let col = this.column + 1; true; col++) {
            if (!chessboard.isValidCoordinate(col, this.row) || chessboard.getPieceAt(col, this.row) == null) {
                break;
            }
            addMove(col, this.row);
        }
        for (let col = this.column - 1; true; col--) {
            if (!chessboard.isValidCoordinate(col, this.row) || chessboard.getPieceAt(col, this.row) == null) {
                break;
            }
            addMove(col, this.row);
        }
        for (let row = this.row + 1; true; row++) {
            if (!chessboard.isValidCoordinate(this.column, row) || chessboard.getPieceAt(this.column, row) == null) {
                break;
            }
            addMove(this.column, row);
        }
        for (let row = this.row - 1; true; row--) {
            if (!chessboard.isValidCoordinate(this.column, row) || chessboard.getPieceAt(this.column, row) == null) {
                break;
            }
            addMove(this.column, row);
        }
        return moves;
    }
    couldGetTo(column, row) {
        return this.column == column || this.row == row;
    }
}
