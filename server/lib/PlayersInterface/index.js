'use strict';
const UniqueNameStorage = require( '../Helpers/UniqueNameStorage' );
const Player = require( './Player' );
const RoomsCollection = require( './Rooms/RoomsCollection' );
class PlayersInterface {
	constructor()
	{
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
		this.roomsCollection = new RoomsCollection();
	}

	getUniqueNameStorage()
	{
		return this.uniqueNameStorage;
	}

	getRoomsCollection()
	{
		return this.roomsCollection;
	}

	addPlayer( client )
	{
		new Player( client, this );
	}
}
module.exports = PlayersInterface;
