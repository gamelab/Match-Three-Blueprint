/**
 * The main game logic.
 *
 * The state of this class is only changed:
 * - externally when the selection state of a tile is changed
 * - internally when it is signalled that all the animations have been performed
 * In both cases the board is checked for matches and then updated accordingly.
 *
 * The tile state is usually updated in an animated fashion, except during
 * initialization where the board is repeatedly cleared to make sure that no
 * matches are left on the board.
 *
 * @class
 * @param {Board} board - the match three board
 * @param {AnimEvents} animEvents - the animation events signal handler
 * @param {function} tileFactory - a parameterless factory to create
 * random MatchThreeTile objects
 */
function MatchThreeLogic(board, animEvents, tileFactory) {
    var that = this;

    this.board = board;
    this.board.forEachCoord(function (coord) {
        that.board.setAtCoord(coord, tileFactory());
    });
    this.board.forEachTile(function (tile) {
        tile.updateScreenCoords({animation:false});
    });

    /* make sure the initial board doesn't contain matches */
    while (this.clearMatches({animation:false}));

    this.animEvents = animEvents;

    this.animEvents.onAnimationComplete(function() {
        that.clearMatches({animation:true});
    });

    this.selected = '';
}

/**
 * Looks for matches starting from tile and advancing in the given direction.
 * @static
 * @param {MatchThreeTile[]} matches - the array of matching tiles
 * @param {MatchThreeTile} tile - the starting tile
 * @param {string} dir - the direction to advance in, left|right|above|below
 */
MatchThreeLogic.getMatchesInDirection = function(matches, tile, dir) {
    var next = tile.coord[dir]();
    while (next && tile.matches(next)) {
        matches.push(next);
        next = next.coord[dir]();
    }
};

/**
 * Looks for matches starting from tile along the given axis
 * @static
 * @param {MatchThreeTile[][]} matches - array of array of matches
 * @param {MatchThreeTile} tile - the starting tile
 * @param {string} direction - the direction to advance in, left|right|above|below
 * @param {string} opposite - the opposite of direction, right|left|below|above
 */
MatchThreeLogic.appendMatchesForAxis = function(matches, tile, direction, opposite) {
    var axis_matches = [tile];
    MatchThreeLogic.getMatchesInDirection(axis_matches, tile, direction);
    MatchThreeLogic.getMatchesInDirection(axis_matches, tile, opposite);
    if (axis_matches.length >= 3) {
        matches.push(axis_matches);
    }
};

/**
 * Get matches for the entire board as an array of matches; each match contains
 * the matching tiles.
 *
 * NOTE: this method, rather unelegantly, returns a match for each matching
 * tile, so for instance a single match of three tiles will return an array of
 * three matches.
 *
 * @returns {MatchThreeTile[][]} - the array with all the matches
 */
MatchThreeLogic.prototype.getMatches = function() {
    var matches = [];
    this.board.forEachTile(function (tile) {
        MatchThreeLogic.appendMatchesForAxis(matches, tile, 'left', 'right');
        MatchThreeLogic.appendMatchesForAxis(matches, tile, 'above', 'below');
    });
    return matches;
};

/**
 * Main entrypoint for user input. It inverts the selection state for the tile
 * under the given board coordinate, and attempts to swap adjacent selected
 * tiles.
 *
 * @param {BoardCoord} - the board coordinate clicked by the user
 */
MatchThreeLogic.prototype.invertTileSelectionState = function (coord) {
    if (this.animEvents.isAnimationOngoing()) {
        return;
    }

    if (coord === undefined) {
        return;
    }

    var tile = this.board.getAtCoord(coord);
    if (tile === undefined) {
        return;
    }

    var that = this;

    if (this.selected === '') {
        // Select your first tile
        this.selected = tile;
    } else if (this.selected === tile) {
        // Deselect current tile
        this.selected = '';
    } else if (this.selected.coord.isAdjacent(tile.coord)) {
        this.swapTiles(this.selected, tile, {animation:true});
        function resetBoardIfNoMatches(context) {
            var matches = that.getMatches();
            if (matches.length === 0) {
                that.swapTiles(that.selected, tile, {animation:true});
            }
            that.selected = '';
        };
        this.animEvents.onNextAnimationComplete(resetBoardIfNoMatches);
    } else {
        // Select new tile
        this.selected = tile;
    }
};

/**
 * Swap two tiles in the board.
 *
 * NOTE: The two tiles don't have to be necessarily adjacent.
 *
 * @param {MatchThreeTile} tile1 - the first tile to swap
 * @param {MatchThreeTile} tile2 - the second tile to swap
 * @param {Object} params - A dictionary of parameters, currently
 * "animation" is recognized to enable or skip animation while updating
 */
MatchThreeLogic.prototype.swapTiles = function(tile1, tile2, params) {
    var coord1 = tile2.coord;
    var coord2 = tile1.coord;
    this.board.setAtCoord(coord1, tile1);
    this.board.setAtCoord(coord2, tile2);
    tile1.updateScreenCoords(params);
    tile2.updateScreenCoords(params);
};

/**
 * Updates the game board after matches have been hidden.
 *
 * @param {Object} params - A dictionary of parameters, currently
 * "animation" is recognized to enable or skip animation while updating
 */
MatchThreeLogic.prototype.updateBoard = function(params) {
    var that = this;
    this.board.forEachTile(function (tile) {
        if (tile.isVisible()) {
            return;
        }
        // starting from the current tile, swap each invisible tile above with
        // the first visible tile further above
        var lowestInvisible;
        while (tile) {
            if (tile.isVisible()) {
                that.swapTiles(tile, lowestInvisible, {animation:false});
                tile.setScreenCoordFromBoard('y', lowestInvisible.coord.y);
                tile.updateScreenCoords(params);
                lowestInvisible = undefined;
            } else if (!lowestInvisible) {
                lowestInvisible = tile;
            }
            tile = tile.coord.above();
        }
        // No visible tile above. Therefore randomize new value for the current one
        var counter = 1;
        while (lowestInvisible) {
            lowestInvisible.randomize();
            lowestInvisible.setVisible(true);
            lowestInvisible.setScreenCoordFromBoard('y', -counter);
            lowestInvisible.updateScreenCoords(params);
            ++counter;
            lowestInvisible = lowestInvisible.coord.above();
        }
    });
};

/**
 * turns any matching tiles invisible
 *
 * @param {MatchThreeTile[][]} matches - an array of arrays of matching tiles
 */
MatchThreeLogic.prototype.hideMatches = function (matches) {
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        for (var j = 0; j < match.length; j++) {
            match[j].setVisible(false);
        }
    }
};

/**
 * Removes any match from the board and updates it accordingly
 *
 * @param {Object} params - A dictionary of parameters, currently
 * "animation" is recognized to enable or skip animation while updating
 * @returns whether any matches were found
 */
MatchThreeLogic.prototype.clearMatches = function(params) {
    var matches = this.getMatches();
    if (matches.length > 0) {
        this.hideMatches(matches);
        this.updateBoard(params);
        return true;
    }
    return false;
}

/**
 * Changes the tile under the given board coordinate, cycling through its
 * possible values.
 *
 * @param {BoardCoord} coord - the coordinate of the tile that should be changed
 */
MatchThreeLogic.prototype.debugChangeKey = function (coord) {
    if (this.animEvents.isAnimationOngoing()) {
        return;
    }

    if (coord === undefined) {
        return;
    }

    var tile = this.board.getAtCoord(coord);
    if (tile === undefined) {
        return;
    }

    tile.debugCycleSprite();
};
