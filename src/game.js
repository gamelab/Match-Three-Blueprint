
/**
* The core EndlessRunner blueprint game file.
* 
* This file is only used to initalise (start-up) the main Kiwi Game 
* and add all of the relevant states to that Game.
*
*/

//Initialise the Kiwi Game. 

var game = new Kiwi.Game('content', 'Match3', null, { renderer: Kiwi.RENDERER_CANVAS });

//Add all the States we are going to use.
game.states.addState(LoadingState);
game.states.addState(IntroState);
game.states.addState(PlayState);

game.states.switchState("LoadingState");