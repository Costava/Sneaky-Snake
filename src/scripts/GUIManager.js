/**
 * Manages switching between different menus
 * @param {number} zhide - z-index of wrapper when it is hidden
 * @param {number} zshow - z-index of wrapper when it should be seen
 * @param {object} wrapper - HTML element, gui wrapper
 */
function GUIManager(zhide, zshow, wrapper) {
	this.zhide = zhide;
	this.zshow = zshow;
	this.wrapper = wrapper;

	this.states = {};
	this.toCallbacks = {};
	this.fromCallbacks = {};

	this.currentState = 'hidden';
}

// MainMenu, Pause, GameOverWin, GameOverDie

/**
 * Hide gui
 */
GUIManager.prototype.hide = function() {
	if (this.fromCallbacks[this.currentState] != undefined) {
		this.fromCallbacks[this.currentState]('hidden');
	}


	
	this.wrapper.innerHTML = "";

	// this.wrapper.style['z-index'] = this.zhide;
	// ^ This line commented out because does not work on Firefox OS v1.3.0.0
	// The below works though. Same situation in GUIManager.prototype.show
	this.wrapper.style.zIndex = this.zhide;

	this.currentState = 'hidden';
};

/**
 * Show the specified gui menu
 * @param {string} state - gui menu to show
 */
GUIManager.prototype.show = function(state) {
	if (this.states[state] != undefined) {
		if (this.fromCallbacks[this.currentState] != undefined) {
			this.fromCallbacks[this.currentState](state);
		}



		this.wrapper.innerHTML = this.states[state];

		// this.wrapper.style['z-index'] = this.zshow;
		this.wrapper.style.zIndex = this.zshow;

		var oldState = this.currentState;
		this.currentState = state;



		if (this.toCallbacks[this.currentState] != undefined) {
			this.toCallbacks[this.currentState](oldState);
		}
	}
};



module.exports = GUIManager;
