/**
 * Represents object on field with snake
 * @Constructor
 * @param {Vector2} pos - position of collider
 * @param {string} kind
 */
function Collider(pos, kind) {
	this.pos = pos;
	this.kind = kind;
}



module.exports = Collider;
