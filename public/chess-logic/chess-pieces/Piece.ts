import ChessBoard from "../ChessBoard";
import Coordinate from "../Coordinate";
import Move from "../Move";


export enum PieceEvent {
    Moved,
    Taken,
    Promoted
}

export default abstract class Piece {
    readonly character: string;
    taken: boolean = false;
    position: Coordinate;
    private listeners: ((event: PieceEvent, data: Object) => void)[] = [];
    private static globalListeners: ((event: PieceEvent, piece: Piece, data: Object) => void)[] = [];

    constructor(pos: Coordinate) {
        this.position = pos;
    }

    getValidMoves(board: ChessBoard): Move[] {
        throw Error("getValidMoves has not been implemented in a class that extends Piece");
    }

    moveTo(pos: Coordinate): void {
        if(this.taken) throw Error("Cannot move taken piece");
        this.callAllListeners(PieceEvent.Moved, {from: this.position, to: pos});
        this.position = pos;
    }
    takenBy(piece: Piece) {
        if(this.taken) throw Error("Cannot take a piece that is already taken");
        this.callAllListeners(PieceEvent.Taken, {by: piece});
        this.taken = true;
    }

    private callAllListeners(event: PieceEvent, data: Object) {
        for(let listener of this.listeners) {
            listener(event, data);
        }
        for(let listener of Piece.globalListeners) {
            listener(event, this, data);
        }
    }

    addPieceEventListener(listener: (event: PieceEvent, data: Object) => void): void {
        this.listeners.push(listener);
    }
    static addGlobalPieceEventListener(listener: (event: PieceEvent, piece: Piece, data: Object) => void): void {
        Piece.globalListeners.push(listener);
    }
}