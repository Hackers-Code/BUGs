'use strict';
const SAT = require( 'sat' );
const BUG_WIDTH = 40;
const BUG_HEIGHT = 45;
class Bug {
	constructor( spawn, id )
	{
		this.hitbox = new SAT.Box( new SAT.Vector( spawn.x, spawn.y ), BUG_WIDTH, BUG_HEIGHT ).toPolygon();
		this.speedX = 0;
		this.speedY = 0;
		this.hp = 200;
		this.angle = 90;
		this.id = id;
		this.owner = 0;
	}

	assignOwnerId( id )
	{
		this.owner = id;
	}

	getData()
	{
		return {
			speedX : this.speedX,
			speedY : this.speedY,
			hp : this.hp,
			x : this.hitbox.calcPoints[ 0 ].x,
			y : this.hitbox.calcPoints[ 0 ].y,
			angle : this.angle,
			owner : this.owner,
			id : this.id
		};
	}
}
module.exports = Bug;
