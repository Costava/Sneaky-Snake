var Vector2 = require('./Vector2.js');
var Direction = require('./Direction.js');

/**
 * @Constructer
 */
function Snake() {
	this.segments = [];

	this.color = new Object();
	this.color.body = new Object();
	this.color.head = new Object();

	this.setColor(201, 255, 4);
}

// .direction needs to be defined before calling .grow or .slide
// Snake.prototype.direction
// Snake.prototype.lastDirectionMoved
// .corner1
// .corner2
// .colliders

Snake.prototype.setColor = function(r, g, b) {
	this.color.body.r = r;
	this.color.body.g = g;
	this.color.body.b = b;

	this.color.body.toString = 'rgb(' +
		this.color.body.r + ', ' +
		this.color.body.g + ', ' +
		this.color.body.b + ')';

	this.color.head.r = Math.round(this.color.body.r * 0.8);
	this.color.head.g = Math.round(this.color.body.g * 0.8);
	this.color.head.b = Math.round(this.color.body.b * 0.8);

	this.color.head.toString = 'rgb(' +
		this.color.head.r + ', ' +
		this.color.head.g + ', ' +
		this.color.head.b + ')';
};

/**
 * Initialize snake based on a dimensions of playing field
 * @param {number} width
 * @param {number} height
 */
Snake.prototype.initialize = function(width, height, colliders) {
	this.segments = [];

	if (width >= height) {
		for (var i = 0; i < 3; i++) {
			this.segments.push(new Vector2(i, Math.floor(height / 2)));
		}

		this.direction = Direction.Right();
	}
	else {
		for (var i = 0; i < 3; i++) {
			this.segments.push(new Vector2(Math.floor(width / 2), i));
		}

		this.direction = Direction.Down();
	}

	this.lastDirectionMoved = this.direction.clone();

	this.corner1 = new Vector2(0, 0);
	this.corner2 = new Vector2(width-1, height-1);

	this.colliders = colliders;
};

Snake.prototype.draw = function(c, ctx) {
	var gridWidth = Math.abs(this.corner2.x - this.corner1.x) + 1;

	var unit = c.width / gridWidth;
	var radius = 0.5 * unit;

	var snakeWidth = 0.85 *  unit;

	//console.log("this:", this);
	var self = this;

	this.segments.forEach(function(value, index, array) {
		var x = value.x * unit;
		var y = value.y * unit;

		//console.log(value);

		ctx.beginPath();
		ctx.arc(x + radius, y + radius, (snakeWidth / 2) - 0.25, 0, Math.PI * 2, true);

		//console.log("this:", this);

		if (index == array.length - 1) {
			// ctx.fillStyle = '#A7DD02';
			ctx.fillStyle = self.color.head.toString;
		}
		else {
			// ctx.fillStyle = '#C9FF04';
			ctx.fillStyle = self.color.body.toString;
		}

		ctx.fill();
		ctx.closePath();

		if (index < array.length - 1) {
			x += radius;
			y += radius;

			var endX = array[index + 1].x * unit;
			var endY = array[index + 1].y * unit;

			endX += radius;
			endY += radius;

			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(endX, endY);

			ctx.lineWidth = snakeWidth;
			// ctx.strokeStyle = '#C9FF04';
			ctx.strokeStyle = self.color.body.toString;
			ctx.stroke();
			ctx.closePath();
		}

		//console.log("segment painted");
	});
};

Snake.prototype.clear = function(c, ctx) {
	var gridWidth = Math.abs(this.corner2.x - this.corner1.x) + 1;
	var gridHeight = Math.abs(this.corner2.y - this.corner1.y) + 1;

	this.segments.forEach(function(value, index, array) {
		var x = value.x * c.width / gridWidth;
		var y = value.y * c.width / gridWidth;

		ctx.clearRect(x-.5, y-.5, c.width / gridWidth + 1, c.height / gridHeight + 1);
	});
};

/**
 * Grow in this.direction
 * @returns {Vector2|undefined} - undefined if this.segments is empty
 */
Snake.prototype.grow = function() {
	if (this.segments.length >= 1) {
		var currentHead = this.segments[this.segments.length - 1];

		var newHead = currentHead.add(this.direction);

		this.segments.push(newHead);

		this.lastDirectionMoved = this.direction.clone();

		return newHead;
	}
	else {
		console.log("Snake cannot grow: has no segments.");
	}
};

/**
 * Slide in this.direction
 * @returns {Vector2|undefined} - undefined if this.segments is empty
 */
Snake.prototype.slide = function() {
	if (this.segments.length >= 1) {
		var currentHead = this.segments[this.segments.length - 1];

		var newHead = currentHead.add(this.direction);

		if (this.segments.length === 1) {
			this.segments = [newHead];
		}
		else {//this.segments.length IS > 1
			for (var i = 0; i < this.segments.length - 1; i++) {
				this.segments[i] = this.segments[i + 1];
			}

			this.segments[this.segments.length - 1] = newHead;
		}

		this.lastDirectionMoved = this.direction.clone();

		return newHead;
	}
	else {
		console.log("Snake cannot slide: has no segments.");
	}
};

/**
 * Returns true if this snake is at v
 * @param {Vector2} v
 * @param {boolean} [excludeTail=false] - whether to exclude tail when
 *  looking for self
 * @returns {boolean}
 */
Snake.prototype.selfAt = function(v, excludeTail) {
	var index = v.indexIn(this.segments);

	if (index === -1) {
		return false;
	}

	// If tail is at v
	if (index === 0) {
		if (excludeTail) {
			return false;
		}
	}

	// Tail or other part of snake is at v
	return true;
};

/**
 * Change direction if the closest spot in that direction (from snake's head) is:
 *  not where the snake already is
 *  is bounded by rectangle formed by corner1 and corner2
 * @param {Vector2} dir
 * @param {Vector2} corner1
 * @param {Vector2} corner2
 * @returns {boolean}
 *  - true if direction safely changed
 *  - false if no change (since change was not safe)
 */
Snake.prototype.safelyChangeDirection = function(dir, corner1, corner2) {
	if (this.segments.length >= 1) {
		var currentHead = this.segments[this.segments.length - 1];

		var newSpot = currentHead.add(dir);

		if (!this.selfAt(newSpot, true) && newSpot.inside(corner1, corner2)) {
			this.direction = dir;

			return true;
		}
	}
	else {
		console.log("Snake cannot change direction: has no segments.");
	}

	return false;
};

/**
 * @param {Collider} collider - value
 * @param {number} index
 * @param {Array} colliders
 */
Snake.prototype.collideWith = function(collider, index, colliders) {
	if (collider.kind === 'food')  {
		// Remove food because eaten
		colliders = colliders.splice(index, 1);

		return this.grow();
	}
};

// moveCallback
Snake.prototype.moveCallback = function() {
	if (this._moveCallback != undefined) {
		this._moveCallback();
	}
};
// dieCallback
Snake.prototype.dieCallback = function() {
	if (this._dieCallback != undefined) {
		this._dieCallback();
	}
};

//moveForward
Snake.prototype.moveForward = function() {
	var currentHead = this.segments[this.segments.length-1];

	var newSpot = currentHead.add(this.direction);

	// console.log("cond", !this.selfAt(newSpot, true), newSpot.inside(this.corner1, this.corner2));

	if (!this.selfAt(newSpot, true) && newSpot.inside(this.corner1, this.corner2)) {
		// Safe to move, but may collide
		var collisionIndex = newSpot.indexIn(this.colliders.map(function(element) {
			return element.pos;
		}));

		if (collisionIndex === -1) {
			this.slide();

			this.moveCallback();
		}
		else {
			var collider = this.colliders[collisionIndex];
			var colliderKind = collider.kind;

			this.collideWith(collider, collisionIndex, this.colliders);

			if (colliderKind === 'food') {
				this.moveCallback();
			}
		}
	}
	else {
		this.dieCallback();
	}
};

Snake.prototype.input = function(inp) {
	if (inp === 'Up' ||
		inp === 'Right' ||
		inp === 'Down' ||
		inp === 'Left' ||
		inp === 'Forward')
		{
		var dir;
		if (inp === 'Forward') {
			dir = this.direction.clone();
		}
		else {
			dir = Direction[inp]();
		}

		var currentHead = this.segments[this.segments.length-1];

		var newSpot = currentHead.add(dir);

		// console.log(dir);
		// console.log(currentHead);
		// console.log(newSpot);

		if (!this.selfAt(newSpot, true) && newSpot.inside(this.corner1, this.corner2)) {
			// Safe to move, but may collide
			this.direction = dir;

			var collisionIndex = newSpot.indexIn(this.colliders.map(function(element) {
				return element.pos;
			}));

			if (collisionIndex === -1) {
				this.slide();

				this.moveCallback();
			}
			else {
				var collider = this.colliders[collisionIndex];
				var colliderKind = collider.kind;

				this.collideWith(collider, collisionIndex, this.colliders);

				if (colliderKind === 'food') {
					this.moveCallback();
				}
			}
		}
	}
};



module.exports = Snake;
