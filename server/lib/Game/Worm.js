'use strict';
class Worm {
	constructor( position, owner, id, physics )
	{
		this.x = position.x;
		this.y = position.y;
		this.hp = 200;
		this.speedX = 0;
		this.speedY = 0;
		this.accelerationY = physics.gravity.readUInt16BE( 0 );
		this.maxSpeedX = physics.maxSpeedX.readUInt16BE( 0 );
		this.maxSpeedY = physics.maxSpeedY.readUInt16BE( 0 );
		this.jumpHeight = physics.jumpHeight.readInt16BE( 0 );
		this.owner = owner;
		this.id = id;
		this.width = 40;
		this.height = 45;
		this.angle = 90;
		this._isMovingRight = false;
		this._isMovingLeft = false;
		this._isFalling = false;
		this._isJumping = false;
	}

	get isMovingLeft()
	{
		return this._isMovingLeft;
	}

	set isMovingLeft( value )
	{
		this._isMovingLeft = value;
	}

	get isMovingRight()
	{
		return this._isMovingRight;
	}

	set isMovingRight( value )
	{
		this._isMovingRight = value;
	}

	get isFalling()
	{
		return this._isFalling;
	}

	set isFalling( value )
	{
		this._isFalling = value;
	}

	get isJumping()
	{
		return this._isJumping;
	}

	set isJumping( value )
	{
		this._isJumping = value;
	}

	isMoving()
	{
		return this.isMovingLeft || this.isMovingRight || this.isFalling || this.isJumping;
	}

	stop()
	{
		this.isMovingRight = false;
		this.isMovingLeft = false;
		this.speedX = 0;
	}

	getID()
	{
		return this.id;
	}

	jump()
	{
		this.speedY = this.jumpHeight;
		this.isJumping = true;
	}

	moveRight()
	{
		this.isMovingLeft = false;
		this.isMovingRight = !this.isMovingRight;
		if( this.angle > 180 )
		{
			this.angle -= (this.angle - 180) * 2;
		}
		if( this.speedX === 0 && this._isMovingRight )
		{
			this.speedX = this.maxSpeedX;
		}
		else
		{
			this.speedX = 0;
		}
	}

	moveLeft()
	{
		this.isMovingRight = false;
		this.isMovingLeft = !this.isMovingLeft;
		if( this.angle < 180 )
		{
			this.angle = 360 - this.angle;
		}
		if( this.speedX === 0 && this.isMovingLeft )
		{
			this.speedX = -this.maxSpeedX;
		}
		else
		{
			this.speedX = 0;
		}
	}

	setAngle( data )
	{
		let angle = data.angle.readInt8( 0 );
		if( angle > 0 )
		{
			this.angle = (this.angle + 2) % 360;
		}
		else if( angle < 0 )
		{
			this.angle = (this.angle - 2) % 360;
		}
	}

	getWormState()
	{
		let owner = Buffer.alloc( 1 );
		owner.writeUInt8( this.owner, 0 );
		let id = Buffer.alloc( 1 );
		id.writeUInt8( this.id, 0 );
		let x = Buffer.alloc( 4 );
		x.writeUInt32BE( this.x, 0 );
		let y = Buffer.alloc( 4 );
		y.writeUInt32BE( this.y, 0 );
		let hp = Buffer.alloc( 1 );
		hp.writeUInt8( this.hp, 0 );
		let speedX = Buffer.alloc( 2 );
		speedX.writeInt16BE( this.speedX, 0 );
		let speedY = Buffer.alloc( 2 );
		speedY.writeInt16BE( this.speedY, 0 );
		let angle = Buffer.alloc( 1 );
		angle.writeUInt8( this.angle / 2, 0 );
		return {
			owner,
			id,
			x,
			y,
			hp,
			speedX,
			speedY,
			angle
		};
	}
}

module.exports = Worm;
