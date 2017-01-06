'use strict';
class Worm {
	constructor( position, owner, id )
	{
		this.x = position.x;
		this.y = position.y;
		this.hp = 200;
		this.speedX = 0;
		this.speedY = 0;
		this.accelerationX = 4;
		this.accelerationY = 437;
		this.maxSpeedX = 2;
		this.maxSpeedY = 875;
		this.owner = owner;
		this.id = id;
		this.width = 40;
		this.height = 45;
	}

	jump()
	{
		if( this.speedY === 0 )
		{
			this.speedY = -300;
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
		speedX.writeUInt16BE( this.speedX, 0 );
		let speedY = Buffer.alloc( 2 );
		speedY.writeUInt16BE( this.speedY, 0 );
		return {
			owner,
			id,
			x,
			y,
			hp,
			speedX,
			speedY
		};
	}
}

module.exports = Worm;
