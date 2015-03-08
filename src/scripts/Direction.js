var Vector2 = require('./Vector2.js');

var Direction = {
	Left: function() {
		return new Vector2(-1, 0);
	},

	//Up is (0, -1) because (0, 0) is the top left corner of a canvas
	Up: function() {
		return new Vector2(0, -1);
	},

	Right: function() {
		return new Vector2(1, 0);
	},

	Down: function() {
		return new Vector2(0, 1);
	}
};



module.exports = Direction;
