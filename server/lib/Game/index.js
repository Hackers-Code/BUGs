'use strict';
const World = require( './World' );
class Game {
	constructor( mapAPI )
	{
		this.mapAPI = mapAPI;
		this.mapID = 0;
		this.playersCount = 0;
		this.physics = {
			gravity : 475,
			jumpHeight : -300,
			maxSpeedY : 1024,
			maxSpeedX : 160
		};
		this.world = null;
	}

	setMapID( mapID )
	{
		this.mapID = mapID;
		this.mapAPI.loadMap( this.mapID, ( error, map ) =>
		{
			if( error )
			{
				this.map = false;
			}
			else
			{
				this.map = map;
			}
		} );
	}

	getMapID()
	{
		return this.mapID;
	}

	setPhysics( data )
	{
		this.physics = {
			gravity : data.gravity,
			jumpHeight : data.jumpHeight,
			maxSpeedY : data.maxSpeedY,
			maxSpeedX : data.maxSpeedX
		};
	}

	getPhysics()
	{
		return this.physics;
	}

	setPlayersCount( count )
	{
		this.playersCount = count;
	}

	canStart()
	{
		return this.map !== false;
	}

	delayedStart( seconds )
	{
		this.world = new World( this.map );
		setTimeout( this.start.bind( this ), seconds * 1000 );
	}

	start()
	{

	}
}

module.exports = Game;
