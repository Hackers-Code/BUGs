'use strict';
const UniqueNameStorage = require( '../Helpers/UniqueNameStorage' );
const Player = require( './Player' );
const RoomsStorage = require( './Rooms/RoomsStorage' );
class PlayersInterface {
	constructor()
	{
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
		this.roomsStorage = new RoomsStorage();
	}

	getUniqueNameStorage()
	{
		return this.uniqueNameStorage;
	}

	getRoomsStorage()
	{
		return this.roomsStorage;
	}

	addPlayer( client )
	{
		new Player( client, this );
	}
}
module.exports = PlayersInterface;
