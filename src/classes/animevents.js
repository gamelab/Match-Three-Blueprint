/**
 * A handler of animation events.
 *
 * Keeps track of currently ongoing animations and sends a signal to any
 * registered entity when all the animations are done.
 *
 * @see onAnimationComplete
 * @see onNextAnimationComplete
 *
 * @class
 */
function AnimEvents() {
    this.animating = 0;
    this.onNextAnimationCompleteCallbacks = [];
    this.onAnimationCompleteCallbacks = [];
}

/**
 * Whether any animations are ongoing. Obviously this only takes into account
 * animations that are registered with this class.
 *
 * @see animationStarted()
 * @see animationFinished()
 *
 * @returns {Boolean} whether any animation is ongoing
 */
AnimEvents.prototype.isAnimationOngoing = function() {
    return this.animating !== 0;
}

/**
 * Register the start of an animation.
 *
 * @see animationFinished
 */
AnimEvents.prototype.animationStarted = function() {
    ++this.animating;
}

/**
 * Register the end of an animation.
 *
 * This event can trigger the execution of the registered callbacks.
 *
 * @see onAnimationComplete
 * @see onNextAnimationComplete
 * @see animationStarted
 */
AnimEvents.prototype.animationFinished = function() {
    --this.animating;
    if (this.animating === 0) {
        while (this.onNextAnimationCompleteCallbacks.length) {
            (this.onNextAnimationCompleteCallbacks.shift())();
        }
        this.onAnimationCompleteCallbacks.forEach(function (callback) {
            callback();
        });
    }
}

/**
 * Register a callback to be called every time animations are finished (a
 * single call as soon as all the animations have stopped).
 *
 * @param {Function} callback - the parameterless function to call
 */
AnimEvents.prototype.onAnimationComplete = function(callback) {
    this.onAnimationCompleteCallbacks.push(callback);
}

/**
 * Register a callback to be called only once, the next time animations are
 * finished (a single call as soon as all the animations have stopped). After
 * that, the callback is automatically deregistered.
 *
 * NOTE: The callbacks registered with this function are executed *before* the
 * permanent ones.
 *
 * @param {Function} callback - the parameterless function to call
 */
AnimEvents.prototype.onNextAnimationComplete = function(callback) {
    this.onNextAnimationCompleteCallbacks.push(callback);
}
