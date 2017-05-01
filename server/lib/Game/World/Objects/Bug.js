'use strict';
const SAT = require( 'sat' );
const Object = require( './Object' );
const BUG_WIDTH = 40;
const BUG_HEIGHT = 45;
const START_HP = 200;
class Bug extends Object {
	constructor( world, spawn, id )
	{
		super( {
			x : spawn.x,
			y : spawn.y,
			width : BUG_WIDTH,
			height : BUG_HEIGHT
		}, {
			affectedByGravity : true,
			destroyable : false,
			collidable : false
		} );
		this.world = world;
		this.game = world.getGame();
		this.physics = this.world.getPhysics();
		this.speedX = 0;
		this.speedY = 0;
		this.hp = START_HP;
		this.angle = 90;
		this.id = id;
		this.owner = 0;
		this.isOnTheGround = this.world.isOnTheGround( this.hitbox );
	}

	isMoving()
	{
		return this.speedX !== 0 || this.speedY !== 0 || !this.isOnTheGround;
	}

	jump()
	{
		if( this.isOnTheGround )
		{
			this.isOnTheGround = false;
			this.speedY = this.physics.jumpHeight;
		}
	}

	moveRight()
	{
		if( this.isOnTheGround )
		{
			if( this.speedX === this.physics.maxSpeedX )
			{
				this.speedX = 0;
			}
			else
			{
				this.speedX = this.physics.maxSpeedX;
			}
		}
	}

	moveLeft()
	{
		if( this.isOnTheGround )
		{
			if( this.speedX === -this.physics.maxSpeedX )
			{
				this.speedX = 0;
			}
			else
			{
				this.speedX = -this.physics.maxSpeedX;
			}
		}
	}

	stopMoving()
	{
		this.speedX = 0;
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

	rotateBy2Degrees( data )
	{
		if( data.angle !== 1 && data.angle !== -1 )
		{
			return;
		}
		this.angle += 2 * data.angle;
		if( this.angle > 360 )
		{
			this.angle -= 360;
		}
		else if( this.angle < 0 )
		{
			this.angle += 360;
		}
	}

	decreaseHP( damage )
	{
		this.hp -= damage;
	}

	removeYourself()
	{
		this.game.removeBug( this.id );
	}
}
module.exports = Bug;
module.exports.START_HP = START_HP;
