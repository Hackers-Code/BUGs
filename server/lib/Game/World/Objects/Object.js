'use strict';
const SAT = require( 'sat' );
class Object {
	constructor( element, flags )
	{
		this.affectedByGravity = flags.affectedByGravity;
		this.destroyable = flags.destroyable;
		this.hitbox = new SAT.Box( new SAT.Vector( element.x, element.y ), element.width, element.height ).toPolygon();
	}
}
module.exports = Object;
