var localforage = require('localforage');

require('browsernizr/test/touchevents');
var Modernizr = require('browsernizr');

var Vector2 = require('./Vector2.js');
var Direction = require('./Direction.js');
var Collider = require('./Collider.js');
var Snake = require('./Snake.js');

var Timestepper = require('./Timestepper.js');
var GUIManager = require('./GUIManager.js');

window.sneakySnake = {};
window.sneakySnake.clearLocalForage = function() {
    localforage.clear(function(err) {
        if (err) {
    		console.log(err);
    	}
        else {
            console.log("localforage cleared");
        }
    });
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * {HTML canvas} c could be landscape, portrait, or square.
 * Returns {object} grid where {number} dim1 and dim2 are accordingly
 * assigned to the width and height of grid based on the aspect ratio of c
 * @param {HTML canvas (object)} c
 * @param {number} dim1
 * @param {number} dim2
 */
function getGrid(c, dim1, dim2) {
    var grid = Object();

    var shortDim = Math.min(dim1, dim2);
    var longDim = Math.max(dim1, dim2);

    if (c.width >= c.height) {
        grid.width = longDim;
        grid.height = shortDim;
    }
    else {
        grid.width = shortDim;
        grid.height = longDim;
    }

    return grid;
}

var c = document.getElementById('game-canvas');
var ctx = c.getContext('2d');

// Relative to each other, establish the aspect ratio of the play field
var playFieldShortDim = 10;
var playFieldLongDim = 16;

// grid changes with resize of window or tilt of device
// Should be recalculated when needed
// var grid = getGrid(c, playFieldShortDim, playFieldLongDim);

/**
 * Maximizes draw width and draw height of canvas (which has aspect ratio of
 * either shortDim/longDim or longDim/shortDim, depending on aspect ratio
 * of parent) based on parent's size
 * @param {HTML canvas (object)} c
 * @param {number} shortDim - Dim is short for dimension
 * @param {number} longDim
 * @param {number} [orientation]
 *     - can be used to force canvas orientation
 *     - Should be {string} 'landscape' or 'portrait'
 */
function maximizeCanvasDrawSize(c, shortDim, longDim, orientation) {
	var parentAspectRatio = c.parentElement.clientWidth / c.parentElement.clientHeight;

	//console.log("parentAspectRatio:", parentAspectRatio);

	var canvasAspectRatio;

    if (orientation == 'landscape') {
        canvasAspectRatio = longDim / shortDim;
    }
    else if (orientation == 'portrait') {
        canvasAspectRatio = shortDim / longDim;
    }

	if (parentAspectRatio >= 1) {
        if (canvasAspectRatio == undefined) {
		    canvasAspectRatio = longDim / shortDim;
        }
		//console.log("canvasAspectRatio:", canvasAspectRatio);

		if (parentAspectRatio > canvasAspectRatio) {
			c.height = c.parentElement.clientHeight;
			c.width = c.height * canvasAspectRatio;
		}
		else {
			c.width = c.parentElement.clientWidth;
			c.height = c.width / canvasAspectRatio;
		}
	}
	else {
        if (canvasAspectRatio == undefined) {
		    canvasAspectRatio = shortDim / longDim;
        }
		//console.log("canvasAspectRatio:", canvasAspectRatio);

		if (parentAspectRatio < canvasAspectRatio) {
			c.width = c.parentElement.clientWidth;
			c.height = c.width / canvasAspectRatio;
		}
		else {
			c.height = c.parentElement.clientHeight;
			c.width = c.height * canvasAspectRatio;
		}
	}
}

/**
 * Maximizes display width and display height of elem (which has aspect
 * of either shortDim/longDim or longDim/shortDim, depending on aspect ratio
 * of parent) based on parent's size
 * @param {HTML element (object)} elem
 * @param {number} shortDim - Dim short for dimension
 * @param {number} longDim
 * @param {number} [orientation]
 *     - can be used to force element orientation
 *     - Should be {string} 'landscape' or 'portrait'
 */
function maximizeElement(elem, shortDim, longDim, orientation) {
	var parentAspectRatio = elem.parentElement.clientWidth / elem.parentElement.clientHeight;

	//console.log("parentAspectRatio:", parentAspectRatio);

	var elemAspectRatio;

    if (orientation == 'landscape') {
        elemAspectRatio = longDim / shortDim;
    }
    else if (orientation == 'portrait') {
        elemAspectRatio = shortDim / longDim;
    }

	if (parentAspectRatio >= 1) {
        if (elemAspectRatio == undefined) {
		    elemAspectRatio = longDim / shortDim;
        }
		//console.log("elemAspectRatio:", elemAspectRatio);

		if (parentAspectRatio > elemAspectRatio) {
			elem.style.height = '100%';
			elem.style.width = 'auto';
		}
		else {
			elem.style.width = '100%';
			elem.style.height = 'auto';
		}
	}
	else {
        if (elemAspectRatio == undefined) {
		    elemAspectRatio = shortDim / longDim;
        }
		//console.log("elemAspectRatio:", elemAspectRatio);

		if (parentAspectRatio < elemAspectRatio) {
			elem.style.width = '100%';
			elem.style.height = 'auto';
		}
		else {
			elem.style.height = '100%';
			elem.style.width = 'auto';
		}
	}
}

/**
 * Resize draw and display dimensions of canvas
 * Hard coded arguments so that this function can be called when an event
 * is dispatched without the event needing to have the appropriate details
 */
function resizeGameCanvas() {
	maximizeCanvasDrawSize(c, playFieldShortDim, playFieldLongDim);
	maximizeElement(c, playFieldShortDim, playFieldLongDim);
}

function clearCoordinates(c, ctx, dim1, dim2, coords) {
    var grid = getGrid(c, dim1, dim2);

    coords.forEach(function(value, index, array) {
        // if (value instanceof Collider) {
        //     value = value.pos;
        // }
        var x = value.x * c.width / grid.width;
        var y = value.y * c.width / grid.width;

        //console.log(value);

        //ctx.fillStyle = '#28991d';

        ctx.clearRect(x-.5, y-.5, c.width / grid.width + 1, c.height / grid.height + 1);
        //console.log("segment painted");
    });
}

function drawColliders(c, ctx, dim1, dim2, colliders) {
	var grid = getGrid(c, dim1, dim2);

	var radius = (c.width / grid.width) / 2;
    //var snakeWidth = 1.7 * radius;

	colliders.forEach(function(collider, index, array) {
        if (collider.kind === 'food') {
    		var x = collider.pos.x * c.width / grid.width;
    		var y = collider.pos.y * c.width / grid.width;

    		// x += radius;
    		// y += radius;

    		ctx.beginPath();
    		ctx.arc(x + radius, y + radius, radius * 0.85, 0, Math.PI * 2, true);
    		ctx.fillStyle = '#1700cc';
    		ctx.fill();
    		ctx.closePath();
        }
	});
}

function clearColliders(c, ctx, dim1, dim2, colliders) {
    var coords = [];

    colliders.forEach(function(value, index, array) {
        coords.push(value.pos);
    });

    clearCoordinates(c, ctx, dim1, dim2, coords);
}

/**
 * Get vacant spot within grid while avoiding occupiedSpots
 * @param {Object} grid - has width and height
 * @returns {Vector2|null} - null if full
 */
function getRandomOpenSpot(grid, occupiedSpots) {
	var totalSpots = grid.width * grid.height;

	if (occupiedSpots.length >= totalSpots) {
		return undefined;
	}

	var x = getRandomInt(0, grid.width - 1);
	var y = getRandomInt(0, grid.height - 1);

	for (var i = 0; i < totalSpots; i++) {
		var spot = new Vector2(x, y);

		var index = spot.indexIn(occupiedSpots);

		if (index === -1) {
			//console.log(index);
			return spot;
		}

		//console.log("try again");

		// Random spot is already occupied, step forward until empty
		x += 1;

		// Rollover row if necessary
		if (x >= grid.width) {
			x -= grid.width;
			y += 1;
		}

		// Go back to beginning if went past end
		if (y >= grid.height) {
			y = 0;
		}
	}
}

/**
 * Get agnostic keycode
 * @param {event} e
 * @returns {Number} keyCode
 */
function getKeyCode(e) {
    //var keyCode = (e.keyCode)? e.keyCode : e.which;

    return e.which;
}
// Chrome and IE give same e.which

// helpful for key debugging
// function getKeyCode(e) {
//     var keyCode = (e.keyCode)? e.keyCode : e.which;
//
//     return keyCode;
// }
//
// document.addEventListener('keydown', function(e) { console.log(e.keyCode, e.which, getKeyCode(e)); });

// 70 slashes
//////////////////////////////////////////////////////////////////////

var snake = new Snake();
var colliders = [];

var gui = new GUIManager(200, 800, document.getElementById('gui'));

var stepper = new Timestepper();

stepper.dt = 400;

var keyboardControls = function(event) {
    var keyCode = getKeyCode(event);
    // console.log(keyCode);

    // clearCoordinates(c, ctx, playFieldShortDim, playFieldLongDim, snake.segments);
    snake.clear(c, ctx);
    // clearCoordinates(c, ctx, playFieldShortDim, playFieldLongDim, colliders);
    clearColliders(c, ctx, playFieldShortDim, playFieldLongDim, colliders);

    // var grid = getGrid(c, playFieldShortDim, playFieldLongDim);

    /*FFChIE*/
    if (keyCode == 87 ||/*w*/
        keyCode == 38/*up arrow*/) {

        snake.input('Up');
    }
    else if (keyCode == 65 ||/*a*/
             keyCode == 37/*left arrow*/) {

        snake.input('Left');
    }
    else if (keyCode == 83 ||/*s*/
             keyCode == 40/*down arrow*/) {

        snake.input('Down');
    }
    else if (keyCode == 68 ||/*d*/
             keyCode == 39/*right arrow*/) {

        snake.input('Right');
    }
    else if (keyCode == 27 ||/*escape key*/
             keyCode == 80/*p*/) {
        // Pause
        console.log("Pause");
        gui.show('pause');
    }

    // drawSnake(c, ctx, playFieldShortDim, playFieldLongDim, snake.segments);
    snake.draw(c, ctx);
    drawColliders(c, ctx, playFieldShortDim, playFieldLongDim, colliders);
};

var getPosition = function(e) {
    if (e.type == "touchstart" || e.type == "touchend") {
        return new Vector2(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }
    else {
        return new Vector2(e.pageX, e.pageY);
    }
};

var startPosition;
var mouseAndTouchStart = function(event) {
    event.preventDefault();

    //console.log(event);

    startPosition = getPosition(event);

    //console.log("X:", startPosition.x, "Y:", startPosition.y);
};

var endPosition;
var mouseAndTouchEnd = function(event) {
    event.preventDefault();

    endPosition = getPosition(event);

    var xLength = endPosition.x - startPosition.x;
    var yLength = endPosition.y - startPosition.y;

    var resultantLength = Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2));

    // Get display width and height of canvas
    // .substring is used to cut the "px" off the end
    var canvasStyleWidth = window.getComputedStyle(c).getPropertyValue('width');
    canvasStyleWidth = canvasStyleWidth.substring(0, canvasStyleWidth.length - 2);
    var canvasStyleHeight = window.getComputedStyle(c).getPropertyValue('height');
    canvasStyleHeight = canvasStyleHeight.substring(0, canvasStyleHeight.length - 2);

    // Diagonal style length of canvas
    var diagonalLength = Math.sqrt(Math.pow(canvasStyleWidth, 2) + Math.pow(canvasStyleHeight, 2));

    // clearCoordinates(c, ctx, playFieldShortDim, playFieldLongDim, snake.segments);
    snake.clear(c, ctx);
    clearColliders(c, ctx, playFieldShortDim, playFieldLongDim, colliders);
    // clearCoordinates(c, ctx, playFieldShortDim, playFieldLongDim, colliders);

    // Move forward if the touch or click drag is too small / a click or tap
    if (resultantLength < 4) {
        // win = playInput('Move', snake);
        snake.input('Forward');
    }
    // Pause if swipe from opposite corners
    else if (resultantLength > 0.75 * diagonalLength) {
        // Pause
        console.log("Pause");
        gui.show('pause');
    }
    else {
        var radAngle = Math.atan2(yLength, xLength);
        //var degAngle = radAngle * (180 / Math.PI);

        // Turn direction of drag into -2, -1, 0, 1, or 2 for easier identification
        var d = radAngle / (Math.PI / 2);
        d = Math.round(d);

        switch(d) {
            case -2://left
                // playInput("Left", snake);
                snake.input('Left');
                break;
            case 2://left
                // playInput("Left", snake);
                snake.input('Left');
                break;
            case -1://up
                // playInput("Up", snake);
                snake.input('Up');
                break;
            case 0://right
                // playInput("Right", snake);
                snake.input('Right');
                break;
            case 1://down
                // playInput("Down", snake);
                snake.input('Down');
                break;
        }
    }

    snake.draw(c, ctx);
    drawColliders(c, ctx, playFieldShortDim, playFieldLongDim, colliders);
};

var bindControls = function() {
    document.addEventListener('keydown', keyboardControls);

    document.addEventListener('mousedown', mouseAndTouchStart);
    document.addEventListener('touchstart', mouseAndTouchStart);

    document.addEventListener('mouseup', mouseAndTouchEnd);
    document.addEventListener('touchend', mouseAndTouchEnd);
};

var unbindControls = function() {
    document.removeEventListener('keydown', keyboardControls);

    document.removeEventListener('mousedown', mouseAndTouchStart);
    document.removeEventListener('touchstart', mouseAndTouchStart);

    document.removeEventListener('mouseup', mouseAndTouchEnd);
    document.removeEventListener('touchend', mouseAndTouchEnd);
};

function preventDefault(event) {
    event.preventDefault();
}

function startNewGame() {
    gui.hide();

    document.getElementById('gui').style.background = "";

    ctx.clearRect(0, 0, c.width, c.height);

    var grid = getGrid(c, playFieldShortDim, playFieldLongDim);

    var orientation;
    if (grid.width >= grid.height) {
        orientation = 'landscape';

        c.style.background = "repeating-linear-gradient(" +
			"0deg," +
			"#28991d," +
			"#28991d 10%," +
			"#17880c 10%," +
			"#17880c 20%";
    }
    else {
        orientation = 'portrait';

        c.style.background = "repeating-linear-gradient(" +
			"90deg," +
			"#28991d," +
			"#28991d 10%," +
			"#17880c 10%," +
			"#17880c 20%";
    }

    function maximizeGameCanvas() {
        maximizeCanvasDrawSize(c, playFieldShortDim, playFieldLongDim, orientation);
        maximizeElement(c, playFieldShortDim, playFieldLongDim, orientation);
    }

    window.addEventListener('resize', maximizeGameCanvas);

    window.addEventListener('touchmove', preventDefault);

    function gameEndCleanup() {
        stepper.Pause();

        unbindControls();

        window.removeEventListener('resize', maximizeGameCanvas);

        window.removeEventListener('touchmove', preventDefault);

        document.getElementById('gui').style.background = 'rgba(50, 50, 50, 0.6)';
    }

    colliders = [];

    // snake can be initialized when colliders is empty because just needs
    // the reference to colliders
    snake.initialize(grid.width, grid.height, colliders);

    // snake.segments = [];
    // //var grid = getGrid(c, playFieldShortDim, playFieldLongDim);
    // for (var h = 0; h < grid.height; h++) {
    //     if (h % 2 == 0) {
    //         for (var w = 1; w < grid.width; w++) {
    //             snake.segments.push(new Vector2(w, h));
    //         }
    //     }
    //     else {
    //         for (var w = grid.width-1; w >= 1; w--) {
    //             snake.segments.push(new Vector2(w, h));
    //         }
    //     }
    // }
    // snake.direction = Direction.Left();
    // snake.lastDirectionMoved = snake.direction.clone();

    var kind = 'food';
    for (var i = 0; i < 3; i++) {
        // concat the snake.segments so that food is not spawned where snake is
        var pos = getRandomOpenSpot(grid, colliders.map(function(element) { return element.pos; }).concat(snake.segments));

        var col = new Collider(pos, kind);

        colliders.push(col);
    }

    snake._moveCallback = function() {
        //var pos = getRandomOpenSpot(grid, colliders.concat(snake.segments));
        // the below takes into account that colliders is an array of Collider
        //  objects and not Vector2s
        var pos = getRandomOpenSpot(grid, colliders.map(function(element) { return element.pos; }).concat(snake.segments));

        if (pos == undefined) {
            var grd = getGrid(c, playFieldShortDim, playFieldLongDim);

            if (snake.segments.length == grd.width * grd.height) {
                // Win
                console.log("Win");

                gameEndCleanup();

                gui.show('win');
            }
        }
        else if (colliders.length < 3) {
            var col = new Collider(pos, 'food');

            colliders.push(col);
        }

        stepper.clear();
    };

    snake._dieCallback = function() {
        // Die
        console.log("Die");

        gameEndCleanup();

        gui.show("gameOver");
    };

    snake.draw(c, ctx);
    drawColliders(c, ctx, playFieldShortDim, playFieldLongDim, colliders);

    bindControls();

    stepper.stepCallback = function() {
        snake.clear(c, ctx);
        clearColliders(c, ctx, playFieldShortDim, playFieldLongDim, colliders);

        snake.moveForward();

        snake.draw(c, ctx);
        drawColliders(c, ctx, playFieldShortDim, playFieldLongDim, colliders);
    };

    stepper.Start();
}

function asideControls(event) {
    var keyCode = getKeyCode(event);
    // console.log(keyCode);

    /*FFChIE*/
    if (keyCode == 66 ||/*b*/
        keyCode == 27 ||/*esc*/
        keyCode == 13/*enter*/) {
        gui.show('main');
    }
}

gui.states.about = '' +
    '<div class="about-info-wrapper">' +
        '<div class="text-info"><strong>Sneaky Snake</strong><br>Author: <a href="https://github.com/Costava" target="_blank">Costava</a><br>Version 1.1.0<br><a href="https://github.com/Costava/Sneaky-Snake" target="_blank">View source on Github</a></div>' +
    '</div>' +
    '<button class="button" id="about-back">Back</button>';
gui.toCallbacks.about = function(oldState) {
    document.getElementById('about-back').addEventListener('click', showMain);

    document.addEventListener('keydown', asideControls);
};
gui.fromCallbacks.about = function(state) {
    document.getElementById('about-back').removeEventListener('click', showMain);

    document.removeEventListener('keydown', asideControls);
};

function showAbout() {
    gui.show("about");
}

gui.states.howToPlay = '' +
    '<div class="text-info how-to-play" id="how-to-play"></div>' +
    '<button class="button" id="how-to-play-back">Back</button>';
gui.toCallbacks.howToPlay = function(oldState) {
    var info = "You are a sneaky snake. Eat tasty blueberries to grow. Watch out for yourself and the edges.";

    var controls = "";

    if (Modernizr.touchevents) {
        controls = "<br><br>Swipe to change direction. Tap to move forward. Swipe from any corner to the opposite corner to pause.";
    }
    else {
        controls = "<ul>" +
                "<li>Use <kbd>WASD</kbd> or arrow keys to move.</li>" +
                "<li>Pause: <kbd>esc</kbd> / <kbd>p</kbd></li>" +
                "<li>Resume: <kbd>esc</kbd> / <kbd>p</kbd> / <kbd>r</kbd> / <kbd>enter</kbd></li>" +
            "</ul>" +
            "Buttons can be activated by pressing their underlined letter.";
    }

    var text = "" + info + controls;

    document.getElementById("how-to-play").innerHTML = text;

    document.getElementById('how-to-play-back').addEventListener('click', showMain);

    document.addEventListener('keydown', asideControls);
};
gui.fromCallbacks.howToPlay = function(state) {
    document.getElementById('how-to-play-back').removeEventListener('click', showMain);

    document.removeEventListener('keydown', asideControls);
};

function showHowToPlay() {
    gui.show("howToPlay");
}

function mainMenuControls(event) {
    var keyCode = getKeyCode(event);
    // console.log(keyCode);

    if (keyCode == 65/*a*/) {
        document.getElementById('about').click();
    }
    else if (keyCode == 72/*h*/) {
        document.getElementById('how-to-play').click();
    }
    else if (keyCode == 78/*n*/) {
        document.getElementById('new-game').click();
    }
}

gui.states.main = '' +
    '<h1 class="main-menu-title">' +
        'Sneaky Snake' +
    '</h1>' +
    '<div class="highScoreHolder text-info">' +
        'High Score: <span id="highScore">...</span>' +
    '</div>' +
    '<button class="button" id="about">About</button>' +
    '<button class="button" id="how-to-play">How to Play</button>' +
    '<button class="button" id="new-game">New Game</button>';
gui.toCallbacks.main = function(oldState) {
    console.log("Show main menu gui");

    c.style.background = "";

    document.getElementById('gui').style.background = "";

    // console.log("coming from",oldState);

    if (oldState != 'about' && oldState != "howToPlay") {
        // console.log("add");

        window.addEventListener('resize', resizeGameCanvas);
        resizeGameCanvas();//inital run
    }

    document.getElementById('new-game').addEventListener('click', startNewGame);
    document.getElementById('about').addEventListener('click', showAbout);
    document.getElementById('how-to-play').addEventListener('click', showHowToPlay);

    document.addEventListener('keydown', mainMenuControls);

    localforage.getItem('highScore', function(err, value) {
        console.log("High score loaded");

        //console.log("value:", value);
        if (value != null) {
            document.getElementById("highScore").innerHTML = value;
        }
    });
};
gui.fromCallbacks.main = function(state) {
    // console.log("going to",state);

    if (state != 'about' && state != "howToPlay") {
        // console.log("remove");
        window.removeEventListener('resize', resizeGameCanvas);
    }

    document.getElementById('new-game').removeEventListener('click', startNewGame);
    document.getElementById('about').removeEventListener('click', showAbout);
    document.getElementById('how-to-play').removeEventListener('click', showHowToPlay);

    document.removeEventListener('keydown', mainMenuControls);
};

function showMain() {
    gui.show("main");
}

function calculateScore() {
    return snake.segments.length;
}

function resume() {
    console.log("Resume");

    gui.hide();

    bindControls();

    stepper.Start();
}

function pauseControls(event) {
    var keyCode = getKeyCode(event);
    // console.log(keyCode);

    /*FFChIE*/
    // if press escape or p or r or enter, then resume
    if (keyCode == 27 ||/*esc*/
        keyCode == 80 ||/*p*/
        keyCode == 82 ||/*r*/
        keyCode == 13/*enter*/) {
        resume();
    }
}

gui.states.pause = '' +
    '<div class="scoreHolder text-info">' +
        'Score: <span id="score">...</span>' +
    '</div>' +
    '<button class="button" id="resume">Resume</button>';
gui.toCallbacks.pause = function(oldState) {
    stepper.Pause();

    unbindControls();

    document.getElementById('gui').style.background = 'rgba(50, 50, 50, 0.6)';

    document.getElementById('score').innerHTML = calculateScore();

    document.getElementById('resume').addEventListener('click', resume);
    document.addEventListener('keydown', pauseControls);
};
gui.fromCallbacks.pause = function(state) {
    document.getElementById('gui').style.background = "";

    document.getElementById('resume').removeEventListener('click', resume);
    document.removeEventListener('keydown', pauseControls);
};

function endGameControls(event) {
    var keyCode = getKeyCode(event);
    // console.log(keyCode);

    /*FFChIE*/
    if (keyCode == 66 ||/*b*/
        keyCode == 27 ||/*esc*/
        keyCode == 13/*enter*/) {
        gui.show('main');
    }
    else if (keyCode == 78/*n*/) {
        document.getElementById('start-new').click();
    }
}

gui.states.gameOver = '' +
'<div class="text-info">You are dead!</div>' +
    '<div class="scoreHolder text-info">' +
        'Score: <span id="score">...</span>' +
    '</div>' +
    '<button class="button" id="start-new">New Game</button>' +
    '<button class="button" id="game-over-back">Back to Main Menu</button>';
gui.toCallbacks.gameOver = function(oldState) {
    var gameScore = calculateScore();

    document.getElementById('score').innerHTML = gameScore;

    document.getElementById('game-over-back').addEventListener('click', showMain);

    document.addEventListener('keydown', endGameControls);

    document.getElementById('start-new').addEventListener('click', startNewGame);

    localforage.getItem('highScore', function(err, value) {
        if (gameScore > value) {
            localforage.setItem('highScore', gameScore, function() {
                console.log("New high score:", gameScore);

                document.getElementsByClassName('scoreHolder')[0].innerHTML = "New High Score: " + gameScore + "!";
                // alert("New high score: " + gameScore + "!");
            });
        }
    });
};
gui.fromCallbacks.gameOver = function(state) {
    document.getElementById('game-over-back').removeEventListener('click', showMain);

    document.removeEventListener('keydown', endGameControls);

    document.getElementById('start-new').removeEventListener('click', startNewGame);
};

gui.states.win = '' +
    '<div class="text-info">Congratulations! You are perfect!</div>' +
    '<div class="scoreHolder text-info">' +
        'Score: <span id="score">...</span>' +
    '</div>' +
    '<button class="button" id="start-new">New Game</button>' +
    '<button class="button" id="win-back">Back to Main Menu</button>';
gui.toCallbacks.win = function(oldState) {
    var gameScore = calculateScore();

    document.getElementById('score').innerHTML = gameScore;

    document.getElementById('win-back').addEventListener('click', showMain);

    document.addEventListener('keydown', endGameControls);

    document.getElementById('start-new').addEventListener('click', startNewGame);

    localforage.getItem('highScore', function(err, value) {
        if (gameScore > value) {
            localforage.setItem('highScore', gameScore, function() {
                console.log("New high score:", gameScore);
                document.getElementsByClassName('scoreHolder')[0].innerHTML = "New High Score: " + gameScore + "!";
                // alert("New high score: " + gameScore + "!");
            });
        }
    });
};
gui.fromCallbacks.win = function(state) {
    document.getElementById('win-back').removeEventListener('click', showMain);

    document.removeEventListener('keydown', endGameControls);

    document.getElementById('start-new').removeEventListener('click', startNewGame);
};

//////////////////////////////////////////////////////////////////////

gui.show('main');

//////////////////////////////////////////////////////////////////////
