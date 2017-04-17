'use strict';
const UniqueNameStorage = require( '../Helpers/UniqueNameStorage' );
const RoomsCollection = require( './Rooms/RoomsCollection' );
const Player = require( './Player' );
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
