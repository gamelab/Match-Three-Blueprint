/**
* The PlayState is the core state that is used in the game.
*/
var PlayState = new Kiwi.State('PlayState');

/**
* This create method is executed when Kiwi Game reaches the boot stage of the
* game loop.
*
* It takes care of initializing all the game logic and resources.
*
* @method create
* @public
*/
PlayState.create = function () {

    /**
     * The gem count controls the amount of varying gems that there should
     * be on the board at a single time.
     * For example if you set this to 8, then there will be 8 different
     * types of gems on the board.
     *
     * (NOTE: setting this too low causes matches to occur too frequently,
     * thus causing the game to enter an almost infinite loop when trying
     * to initialize the board; setting it too high on the other hand can make
     * the game too difficult for the player).
     */
    var gemCount = 8;

    /*
     * If you want to be more tricky you can also dynamically set the
     * gemCount to be the same as the number of cells/frames in
     * a spritesheet.
     *
     * To try this out use the line which is commented out below.
     */
    // gemCount = this.textures.gems.cells.length;

    /**
     * The width/height of a single tile.
     **/
    var tileSize = {x: 60, y: 60};

    /*
     * The width/height of the board in tiles.
     *
     * Again if you want to be tricky you could always make the
     * width/height of the board in tiles match the Stages width/height.
     */
    var boardSize = { x: 7, y: 10 };

    /*
     * The offset of the board in screen coordinates.
     */
    var offset = {x: 0, y: 0};

    var spritesheet = this.textures.gems;
    this.coordMapper = new CoordMapper(tileSize, offset);
    var animEvents = new AnimEvents();
    var board = new Board(boardSize);
    var tileFactory = MatchThreeTile.createFactory(
        this,
        spritesheet,
        gemCount,
        this.coordMapper,
        animEvents
        );

    /*
     * Here we initialize the class that encapsulates all game logic.
     */
    this.logic = new MatchThreeLogic(board, animEvents, tileFactory);

    // Enable Swipe.
    this.enableSwipe = true;

    /*
     * Register onClick callbacks.
     */
    this.game.input.onUp.add(this.clickTileDown, this);
    if(this.enableSwipe) {
        this.game.input.onDown.add(this.clickTileUp, this);
    }

    /*
     * Key to change tiles at will, useful for debugging purposes.
     */
    // this.debugChangeKey = this.game.input.keyboard.addKey(Kiwi.Input.Keycodes.C);
    this.debugChangeKey = {isDown:false};
}


/**
* This method is continuously executed.
* @method update
* @public
*/
PlayState.update = function(){
    Kiwi.State.prototype.update.call(this);

    /*
     * Here we don't need to do anything regarding our game logic as all game
     * activity is triggered by the following events:
     * - user generated events (e.g. clicks, see below)
     * - internal events (e.g. when an animation completes)
     */
}


/**
* This method is executed when a gem is clicked.
* @method clickTileDown
* @public
*/
PlayState.clickTileDown = function (mouseX, mouseY) {
    var coord = this.coordMapper.screenToBoard({x: mouseX, y: mouseY});
    if (this.debugChangeKey.isDown) {
        this.logic.debugChangeKey(coord);
    } else {
        this.logic.invertTileSelectionState(coord);
    }
}

PlayState.clickTileUp = function (mouseX, mouseY) {
    var coord = this.coordMapper.screenToBoard({x: mouseX, y: mouseY});
    this.logic.invertTileSelectionState(coord);
}
