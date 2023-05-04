import Piece from "./chess-pieces/Piece";

type Move = {
    from: { row: number, column: number },
    to: { row: number, column: number },
    piece: Piece
}
export default Move;