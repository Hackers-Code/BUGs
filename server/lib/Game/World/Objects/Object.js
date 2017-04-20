'use strict';
class Object {
	constructor( element )
	{
		this.hitbox = new SAT.Box( new SAT.Vector( element.x, element.y ), element.width, element.height ).toPolygon();
	}
}
module.exports = Object;
