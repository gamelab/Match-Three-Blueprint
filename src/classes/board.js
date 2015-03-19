/**
 * The game board, a convenience class to wrap access to the actual container
 * of tiles.
 *
 * The related class BoardCoord is an iterator of this container.
 *
 * The main invariant of this class is that, after the initialization phase, at
 * a given BoardCoord an object exist whose "coord" member has the same value
 * as the given BoardCoord:
 *
 *    board.getAtCoord(coord).coord === coord
 *
 * @see BoardCoord
 *
 * @class
 *
 * @param {Object} size - the logical size of the board expressed as the x and
 * y values of the given object
 */
function Board(size) {
    this.size = size;
    this.columns = [];
    for (var i = 0; i < size.x; i++) {
        this.columns.push(new Array(size.y));
    };
}

/**
 * An action to perform on a given tile.
 * @callback tileCallback
 * @param {MatchThreeTile} tile - the tile on which to perform the action
 */

/**
 * Calls the given callback for each tile. Lower tiles are guaranteed to be
 * called before higher tiles.
 *
 * @param {tileCallback} callback - the action to perform on each tile
 */
Board.prototype.forEachTile = function(callback) {
    // NOTE: loop from below
    for (var x = 0; x < this.size.x; x++) {
        for (var y = this.size.y - 1; y >= 0; y--) {
            callback(this.columns[x][y]);
        }
    }
}

/**
 * An action to perform on a given board coord.
 * @callback coordCallback
 * @param {BoardCoord} coord - the coord on which to perform the action
 */

/**
 * Calls the given callback for each board coord.
 *
 * @param {coordCallback} callback - the action to perform on each coord
 */
Board.prototype.forEachCoord = function(callback) {
    for (var x = 0; x < this.size.x; x++) {
        for (var y = 0; y < this.size.y; y++) {
            callback(new BoardCoord(this, x, y));
        }
    }
}

/**
 * Access a tile given a board coord.
 *
 * @param {BoardCoord} coord - the board coordinate of the tile
 * @returns {MatchThreeTile|undefined} the desired tile or undefined if out of
 * range
 */
Board.prototype.getAtCoord = function(coord) {
    return (this.columns[coord.x] || {})[coord.y];
}

/**
 * Sets a tile at the given board coord.
 *
 * @param {BoardCoord} coord - the desired board coordinate of the tile
 * @param {MatchThreeTile} tile - the given tile
 */
Board.prototype.setAtCoord = function(coord, tile) {
    this.columns[coord.x][coord.y] = tile;
    tile.coord = coord;
}
