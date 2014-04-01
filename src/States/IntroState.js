var IntroState = new Kiwi.State('IntroState');


IntroState.create = function () {
    game.states.switchState("PlayState");
}