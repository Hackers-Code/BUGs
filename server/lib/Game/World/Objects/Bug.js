'use strict';
const SAT = require( 'sat' );
const Object = require( './Object' );
const BUG_WIDTH = 40;
const BUG_HEIGHT = 45;
class Bug extends Object {
	constructor( spawn, id )
	{
		super( {
			x : spawn.x,
			y : spawn.y,
			width : BUG_WIDTH,
			height : BUG_HEIGHT
		}, {
			affectedByGravity : true,
			destroyable : false
		} );
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
			x : this.hitbox.pos.x + this.hitbox.calcPoints[ 0 ].x,
			y : this.hitbox.pos.y + this.hitbox.calcPoints[ 0 ].y,
			angle : parseInt( this.angle / 2 ),
			owner : this.owner,
			id : this.id
		};
	}
}
module.exports = Bug;
