/**
 * Represents a vector2
 * @Constructor
 * @param {number} [x=0]
 * @param {number} [y=0]
 */
function Vector2(x, y) {
	if (x !== undefined) {
		this.x = x;
	}
	if (y !== undefined) {
		this.y = y;
	}
}

Vector2.prototype.x = 0;
Vector2.prototype.y = 0;

Vector2.prototype.equals = function(v) {
	if (this.x === v.x && this.y === v.y) {
		return true;
	}
	else {
		return false;
	}
};

Vector2.prototype.add = function(v) {
	return new Vector2(this.x + v.x, this.y + v.y);
};

Vector2.prototype.indexIn = function(array) {
	for (var i = 0; i < array.length; i++) {
		if (this.equals(array[i])) {
			return i;
		}
	}

	return -1;
};

Vector2.prototype.inside = function(v1, v2) {
	// console.log("v1", v1);
	// console.log("v2", v2);
	if (this.x >= Math.min(v1.x, v2.x) &&
		this.x <= Math.max(v1.x, v2.x) &&

		this.y >= Math.min(v1.y, v2.y) &&
		this.y <= Math.max(v1.y, v2.y)) {
		return true;
	}
	else {
		return false;
	}
};

Vector2.prototype.switched = function() {
	return new Vector2(this.y, this.x);
};

Vector2.prototype.clone = function() {
	return new Vector2(this.x, this.y);
};



module.exports = Vector2;
