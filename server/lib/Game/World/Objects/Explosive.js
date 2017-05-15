'use strict';
const Object = require( './Object' );
class Explosive extends Object {
	constructor( element, weaponData )
	{
		super( {
			x : element.x,
			y : element.y,
			width : element.width,
			height : element.height
		}, {
			notifyIfOnTheGround : true,
			affectedByGravity : true
		} );
		this.weaponData = weaponData;
		this.speedX = 0;
		this.speedY = 0;
		this.isOnTheGround = false;
	}

	setVelocity( angle, power )
	{
		let powerSpeed = power * 1000 / 255;
		this.speedX = Math.sin( angle * Math.PI / 180 ) * powerSpeed;
		this.speedY = -Math.cos( angle * Math.PI / 180 ) * powerSpeed;
		this.isOnTheGround = false;
	}

	notifyOnTheGround()
	{
		this.speedY = 0;
		this.isOnTheGround = true;
	}
}
module.exports = Explosive;
