const Room = require( './Room.js' );
const UniqueID = require( './UniqueKeyGenerator.js' );
const UniqueName = require( './UniqueNameStorage.js' );

class Rooms {
	constructor()
	{
		this.rooms = [];
		this.keyGenerator = new UniqueID( 4 );
		this.nameStorage = new UniqueName( 20 );
	}

	addRoom( name, ownerID )
	{
		if( this.nameStorage.checkName( name ) )
		{
			let room = new Room( this.keyGenerator.generateKey(), name, ownerID );
			this.rooms.push( room );
			return true;
		}
		console.log( 'Room name is not unique' );
		return false;
	}

	getRooms()
	{
		let gamesCount = this.rooms.length;
		let retval = Buffer.allocUnsafe( 4 );
		retval.writeInt32BE( gamesCount, 0 );
		for( let i = 0 ; i < gamesCount ; i++ )
		{
			retval = Buffer.concat( [
				retval,
				this.rooms[ i ].id,
				this.rooms[ i ].name
			] );
		}
		return retval;
	}
}

module.exports = Rooms;