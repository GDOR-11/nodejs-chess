export default class Coordinate {
    /** 0-indexed */
    private _row: number;
    /** 0-indexed */
    private _column: number;

    constructor(column: number, row: number) {
        this.column = column;
        this.row = row;
    }

    toString(): string {
        return String.fromCharCode(this.row + 97) + this.column;
    }

    //#region getters & setters
    /** 0-indexed */
    get row() {
        return this._row;
    }
    private set row(row) {
        this._row = row;
    }
    /** 0-indexed */
    get column() {
        return this._column;
    }
    private set column(column) {
        this._column = column;
    }
    //#endregion
}