const UniqueNameStorage = require( '../Helpers/UniqueNameStorage' );
const Player = require( './Player' );
class PlayersStorage {
	constructor()
	{
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
	}

	getUniqueNameStorage()
	{
		return this.uniqueNameStorage;
	}

	addPlayer( client )
	{
		new Player( client, this );
	}
}
module.exports = PlayersStorage;
