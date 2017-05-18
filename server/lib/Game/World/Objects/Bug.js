'use strict';
const SAT = require( 'sat' );
const Object = require( './Object' );
const Explosive = require( './Explosive' );
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
			notifyIfOnTheGround : true,
			affectedByGravity : true
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

	notifyOnTheGround( oldSpeedY )
	{
		if( oldSpeedY >= this.physics.maxSpeedY / 2 )
		{
			this.decreaseHP( START_HP * (oldSpeedY / this.physics.maxSpeedY) );
		}
		this.isOnTheGround = true;
	}

	setAngle( data )
	{
		if( data.angle > 180 )
		{
			return;
		}
		this.angle = 2 * data.angle;
	}

	decreaseHP( damage )
	{
		this.hp -= damage;
		if( this.hp <= 0 )
		{
			this.removeYourself();
		}
	}

	setHitVelocity( angle, power )
	{
		let powerSpeed = power * 1000 / 255;
		this.speedX = Math.sin( angle * Math.PI / 180 ) * powerSpeed;
		this.speedY = -Math.cos( angle * Math.PI / 180 ) * powerSpeed;
		this.isOnTheGround = false;
	}

	removeYourself()
	{
		this.game.removeBug( this.id, this.owner );
	}

	calculateWeaponPosition()
	{
		return {
			x : this.hitbox.pos.x + (BUG_WIDTH / 2),
			y : this.hitbox.pos.y + (BUG_HEIGHT / 2)
		};
	}

	meleeAttack( weapon, power )
	{
		let weaponPos = this.calculateWeaponPosition();
		let weaponHitbox = new SAT.Box( new SAT.Vector( weaponPos.x, weaponPos.y ), 5, weapon.radius ).toPolygon();
		weaponHitbox.rotate( (360 - this.angle) * Math.PI / 180 );
		this.world.meleeAttack( weaponHitbox, {
			dmg : weapon.dmg,
			owner : this.owner,
			power,
			angle : this.angle
		} );
	}

	shoot( weapon, power )
	{
		let startPos = this.calculateWeaponPosition();
		let hitRange = new SAT.Box( new SAT.Vector( startPos.x, startPos.y ), 2, weapon.radius ).toPolygon();
		hitRange.rotate( (360 - this.angle) * Math.PI / 180 );
		this.world.shoot( hitRange, {
			dmg : weapon.dmg,
			owner : this.owner,
			power,
			angle : this.angle
		} );
	}

	useExplosive( weapon, power )
	{
		let startPos = this.calculateWeaponPosition();
		let explosive = new Explosive( {
			x : startPos.x,
			y : startPos.y,
			width : 5,
			height : 5
		}, weapon );
		explosive.setVelocity( this.angle, power );
		this.world.spawnExplosive( explosive );
	}
}
module.exports = Bug;
