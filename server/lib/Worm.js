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
		this.height = 45
	}
}

module.exports = Worm;
