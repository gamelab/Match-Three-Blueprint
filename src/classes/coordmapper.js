/**
 * Encapsulates the conversion between screen coordinates and board coordinates
 * taking tile size and board offset into account.
 *
 * @class
 *
 * @param {Object} size - object with x y size of a single tile, in screen
 * coordinates
 * @param {Object} offset - object with x y top-left offset of a board, in
 * screen coordinates
 */
function CoordMapper(size, offset) {
    this.size = size;
    this.offset = offset;
}

/**
 * Converts a board coordinate (typically a BoardCoord) into its equivalent
 * screen coordinate given the current mapping.
 *
 * This method works on a single axis.
 *
 * @param {String} axis - "x" or "y"
 * @param {Integer} axisCoord - the board coordinate along that axis
 *
 * @returns {Number} the screen coordinate along the given axis
 */
CoordMapper.prototype.boardToScreenAxis = function(axis, axisCoord) {
    return axisCoord * this.size[axis] + this.offset[axis];
};

/**
 * Converts board coordinates (typically a BoardCoord) into their equivalent
 * screen coordinates given the current mapping.
 *
 * @param {Object} coord - the board coordinates as x and y values of the given
 * object
 *
 * @returns {Object} the screen coordinates as x and y values
 */
CoordMapper.prototype.boardToScreen = function(coord) {
    return {
        x: this.boardToScreenAxis('x', coord.x),
        y: this.boardToScreenAxis('y', coord.y),
    };
};

/**
 * Converts a screen coordinate into its equivalent board coordinate given the
 * current mapping. The resulting coordinate isn't necessarily valid but can be
 * validated through other means, e.g. by creating a BoardCoord object out of
 * it.
 *
 * This method works on a single axis.
 *
 * @param {String} axis - "x" or "y"
 * @param {Number} axisCoord - the screen coordinate along that axis
 *
 * @returns {Integer} the board coordinate along the given axis
 */
CoordMapper.prototype.screenToBoardAxis = function(axis, axisCoord) {
    return Math.floor((axisCoord - this.offset[axis]) / this.size[axis]);
};

/**
 * Converts screen coordinates into their equivalent board coordinates given
 * the current mapping. The resulting coordinates aren't necessarily valid but
 * can be validated through other means, e.g. by creating a BoardCoord object
 * out of them.
 *
 * @param {Object} coord - the screen coordinates as x and y values of the
 * given object
 *
 * @returns {Object} the board coordinates as x and y values
 */
CoordMapper.prototype.screenToBoard = function(coord) {
    return {
        x: this.screenToBoardAxis('x', coord.x),
        y: this.screenToBoardAxis('y', coord.y),
    };
};
