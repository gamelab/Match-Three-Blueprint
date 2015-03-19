/**
 * This is an iterator for the Board class.
 *
 * Note: y goes downward
 *
 * @param {Board} board - the board this coordinate iterates on
 * @param {Integer} x - the logical horizontal position on the board
 * @param {Integer} y - the logical vertical position on the board (starting
 * from the top)
 *
 * @class
 */
function BoardCoord(board, x, y) {
    this.board = board;
    this.x = x;
    this.y = y;
}

/**
 * @return {BoardCoord|undefined} the board coordinate left of the current one
 * or undefined if out of bounds
 */
BoardCoord.prototype.left = function() {
    return this.board.getAtCoord({x: this.x - 1, y: this.y});
}

/**
 * @return {BoardCoord|undefined} the board coordinate right of the current one
 * or undefined if out of bounds
 */
BoardCoord.prototype.right = function() {
    return this.board.getAtCoord({x: this.x + 1, y: this.y});
}

/**
 * @return {BoardCoord|undefined} the board coordinate above of the current one
 * or undefined if out of bounds
 */
BoardCoord.prototype.above = function() {
    return this.board.getAtCoord({x: this.x, y: this.y - 1});
}

/**
 * @return {BoardCoord|undefined} the board coordinate below of the current one
 * or undefined if out of bounds
 */
BoardCoord.prototype.below = function() {
    return this.board.getAtCoord({x: this.x, y: this.y + 1});
}

/**
 * @param {BoardCoord} other - the board coordinate to check against
 * @return {Boolean} whether the two board coordinates are adjacent
 */
BoardCoord.prototype.isAdjacent = function(other) {
    if (this.x != other.x && this.y != other.y) {
        return false;
    }
    return 1 >= Math.max(
        Math.abs(other.x - this.x),
        Math.abs(other.y - this.y)
        );
}
