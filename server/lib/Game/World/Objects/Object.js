'use strict';
const SAT = require( 'sat' );
class Object {
	constructor( element, flags )
	{
		this.notifyIfOnTheGround = flags.notifyIfOnTheGround || false;
		this.affectedByGravity = flags.affectedByGravity || false;
		this.destroyable = flags.destroyable || false;
		this.collidable = flags.collidable || false;
		this.hitbox = new SAT.Box( new SAT.Vector( element.x, element.y ), element.width, element.height ).toPolygon();
	}
}
module.exports = Object;
