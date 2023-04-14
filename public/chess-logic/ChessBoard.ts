import Coordinate from "./Coordinate";
import Move from "./Move";
import Piece, { PieceEvent } from "./chess-pieces/Piece";


/** it's the array of columns (you should access it like state[x][y] or state[col][row], not the opposite) */
export type ChessBoardState = (Piece | null)[][];

export default class ChessBoard {
    state: ChessBoardState;
    size: [number, number];
    pieces: Set<Piece>;
    checkWatchList: Set<Piece>;

    constructor(state: ChessBoardState) {
        this.state = state;
        this.size = [this.state.length, this.state[0].length];
        this.updatePiecesArray();

        Piece.addGlobalPieceEventListener((event: PieceEvent, piece: Piece, data: Object) => {
            if(!this.pieces.has(piece)) return;
            if(event == PieceEvent.Taken) {
                this.pieces.delete(piece);
                this.checkWatchList.delete(piece);
            }
        });
    }

    /**
     * get piece at specified coordinate
     * @returns Piece when there is a piece at the location, null when there is no piece and undefined when the location is out of the chessboard
     * */
    getPieceAt(coordinate: Coordinate): Piece | null | undefined;
    /**
     * get piece at specified location
     * @returns Piece when there is a piece at the location, null when there is no piece and undefined when the location is out of the chessboard
     * */
    getPieceAt(column: number, row: number): Piece | null | undefined;
    getPieceAt(first: Coordinate | number, second?: number): Piece | null | undefined {
        if(second === undefined) /* Coordinate was given in first */ {
            const coordinate = first as Coordinate;

            return this.state[coordinate.row] ? this.state[coordinate.row][coordinate.column] : undefined;
        } else /* column was given in first and row in second */ {
            const column = first as number;
            const row = second as number;
            
            return this.state[row] ? this.state[row][column] : undefined;
        }
    }

    updateCheckWatchList(): void {

    }
    /** counts all the pieces in the chessboard and pushes them all to this.pieces */
    updatePiecesArray(): void {
        this.pieces = [];
        for(let col = 0;col < this.size[0];col++) {
            for(let row = 0;row < this.size[1];row++) {
                let piece = this.getPieceAt(col, row);
                if(piece instanceof Piece) {
                    this.pieces.push(piece);
                }
            }
        }
    }

    // TODO: check again if responsability should be here
    moveIsPossible(move: Move): boolean {
        
    }
}