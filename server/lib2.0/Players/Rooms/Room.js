'use strict';
class Room {
	constructor( settings, admin, id, roomsStorage )
	{
		this.nextClientId = 0;
		this.name = settings.name;
		this.password = settings.password;
		this.admin = admin;
		this.admin.assignRoom( this, this.nextClientId++, true );
		this.players = [];
		this.players.push( admin );
		this.id = id;
		this.roomsStorage = roomsStorage;
		this.isWaitingForPlayers = false;
		this.physics = {
			gravity : 475,
			jumpHeight : -300,
			maxSpeedY : 1024,
			maxSpeedX : 160
		};
		this.playersCount = 0;
		this.mapID = 0;
	}

	isAvailable()
	{
		return this.isWaitingForPlayers;
	}

	getPlayersList()
	{
		let retval = [];
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			retval.push( this.players[ i ].getPublicData() );
		}
		return retval;
	}

	getReadyPlayersCount()
	{
		let retval = 0;
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			retval += this.players[ i ].isReady();
		}
		return retval;
	}

	setPhysics( data )
	{
		this.physics = data;
		return true;
	}

	setConfig( data )
	{
		this.mapID = data.map;
		this.playersCount = data.players;
		return false;
	}
}

module.exports = Room;
