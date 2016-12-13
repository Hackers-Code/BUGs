'use strict';
class Worm {
	constructor( position, owner )
	{
		this.x = position.x;
		this.y = position.y;
		this.hp = 200;
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.xAcceleration = 0;
		this.yAcceleration = 0;
		this.xMaxSpeed = 0;
		this.yMaxSpeed = 0;
		this.owner = 0;
		this.id = 0;
		this.width = 120;
		this.height = 120
	}
}

module.exports = Worm;
