/**
 * A match-three tile. It wraps a Kiwi sprite object.
 *
 * @class
 *
 * @param {PlayState} state - the Kiwi state that will be used as a parent for
 * the sprite
 * @param {SpriteSheet} spritesheet - the spritesheet for the tile's appearance
 * @param {Integer} gemCount - the number of animation frames (i.e. different
 * tile faces) available in the spritesheet
 * @param {CoordMapper} coordMapper - an object able to map board coordinates
 * to screen coordinates and viceversa
 * @param {AnimEvents} animEvents - an object to register the tile's animation
 * state so that interested parties can be notified when some events occur
 * (e.g. all animations are completed)
 */
function MatchThreeTile(state, spritesheet, gemCount, coordMapper, animEvents) {
    this.state = state;
    this.gemCount = gemCount;
    this.coordMapper = coordMapper;
    this.animEvents = animEvents;

    this.sprite = new Kiwi.GameObjects.Sprite(this.state, spritesheet);
    this.state.addChild(this.sprite);
    this.randomize();
};

/**
 * @return a parameterless factory function for convenience
 * @static
 * @param {PlayState} state - the Kiwi state that will be used as a parent for
 * the sprite
 * @param {SpriteSheet} spritesheet - the spritesheet for the tile's appearance
 * @param {Integer} gemCount - the number of animation frames (i.e. different
 * tile faces) available in the spritesheet
 * @param {CoordMapper} coordMapper - an object able to map board coordinates
 * to screen coordinates and viceversa
 * @param {AnimEvents} animEvents - an object to register the tile's animation
 * state so that interested parties can be notified when some events occur
 * (e.g. all animations are completed)
 */
MatchThreeTile.createFactory = function(state, spritesheet, gemCount, coordMapper, animEvents) {
    return function() {
        return new MatchThreeTile(
            state,
            spritesheet,
            gemCount,
            coordMapper,
            animEvents
            );
    };
};

/**
 * Inverse animation speed in milliseconds per pixel.
 * @static
 */
MatchThreeTile.INVERSE_SPEED = 5;

/**
 * Changes the tile appearance and value. Useful to generate a new tile out of
 * a cleared one.
 */
MatchThreeTile.prototype.randomize = function() {
    var rand = Math.floor(Math.random() * this.gemCount);
    this.sprite.animation.switchTo(rand);
};

/**
 * Figures out the screen coordinate of the given board coordinate and assigns
 * it.
 *
 * NOTE: This is limited to a single axis that must be specified, just because
 * sometimes it's more convenient to compute and pass just a single value
 * rather than a full BoardCoord.
 *
 * @param {String} axis - "x" or "y", the axis that is going to be set
 * @param {Int} axisCoord - the single axis board coordinate to set
 */
MatchThreeTile.prototype.setScreenCoordFromBoard = function(axis, axisCoord) {
    this.sprite[axis] = this.coordMapper.boardToScreenAxis(axis, axisCoord);
};

/**
 * Whether this tile matches another tile for game matching purposes.
 *
 * @param {MatchThreeTile} other - the tile to match against
 */
MatchThreeTile.prototype.matches = function(other) {
    return this.sprite.animation.frameIndex == other.sprite.animation.frameIndex;
};

/**
 * Moved the current screen coordinates towards the correct position on the
 * board. If no animation is required, the tile is moved immediately.
 *
 * @see startAnimation
 * @see MatchThreeTile.INVERSE_SPEED
 *
 * @param {Object} params - An optional dictionary of parameters, currently
 * "animation" is recognized to enable or disable animation.
 */
MatchThreeTile.prototype.updateScreenCoords = function(params) {
    if (params.animation) {
        this.startAnimation();
    } else {
        this.setScreenCoordFromBoard('x', this.coord.x);
        this.setScreenCoordFromBoard('y', this.coord.y);
    }
}

/**
 * Start the animation on this tile.
 *
 * NOTE: the animation moved the tile from its current screen coordinates to
 * the screen coordinates computed out of its board coordinates. While they
 * should usually be the same, they can become different after operations such
 * as swapping or setting the screen coordinates explicitly.
 *
 * NOTE: this method internally uses Kiwi Tween objects to perform interesting
 * animations, feel free to swap to different Tween styles to check how the
 * game feeling changes!
 *
 * @see updateScreenCoords
 */
MatchThreeTile.prototype.startAnimation = function() {
    this.animEvents.animationStarted();
    var properties = this.coordMapper.boardToScreen(this.coord);
    var distance = {
        x: Math.abs(properties.x - this.sprite.x),
        y: Math.abs(properties.y - this.sprite.y),
    };
    var duration = MatchThreeTile.INVERSE_SPEED * Math.max(distance.x, distance.y);
    var tween = this.state.game.tweens.create(this.sprite);
    tween.to(
        properties,
        duration,
        Kiwi.Animations.Tweens.Easing.Sinusoidal.Out,
        true
        );
    var that = this;
    tween.onComplete(function (context, object) {
        that.animEvents.animationFinished();
    });
};

/**
 * Sets the visibility of the underlying Kiwi GameObject.
 *
 * @param {Boolean} visible - the new visibility state
 */
MatchThreeTile.prototype.setVisible = function(visible) {
    this.sprite.visible = visible;
};

/**
 * Queries the visibility of the underlying Kiwi GameObject.
 */
MatchThreeTile.prototype.isVisible = function() {
    return this.sprite.visible;
};

/**
 * Debug method to artificially change the value of an existing tile.
 */
MatchThreeTile.prototype.debugCycleSprite = function() {
    var newFrameIndex = (this.sprite.animation.frameIndex + 1) % this.gemCount;
    this.sprite.animation.switchTo(newFrameIndex);
};
