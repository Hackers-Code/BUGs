const UniqueKeyGenerator = require( './UniqueKeyGenerator' );
const UniqueNameStorage = require( './UniqueNameStorage' );
const Client = require( './Client' );
class ClientsStorage {
	constructor( roomsStorage )
	{
		this.clients = [];
		this.roomsStorage = roomsStorage;
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20 );
	}

	addClient( socket )
	{
		let client = new Client( socket, this );
		this.clients.push( client );
	}

	removeClient( socketId )
	{
		let client = this.findClientBySocketId( socketId );
		if( client !== false && client !== -1 )
		{
			this.clients.splice( client, 1 );
		}
		else
		{
			console.log( 'Client not found' );
			return false;
		}
	}

	generateId()
	{
		return this.uniqueKeyGenerator.generateKey();
	}

	addName( name )
	{
		return this.uniqueNameStorage.addName( name );
	}

	removeName( name )
	{
		return this.uniqueNameStorage.removeName( name );
	}

	listAvailableGames()
	{
		return this.roomsStorage.listAvailableGames();
	}

	addRoom( settings, client )
	{
		return this.roomsStorage.addRoom( settings, client );
	}

	joinGame( params, client )
	{
		return this.roomsStorage.joinGame( params, client );
	}

	findClientBySocketId( socketId )
	{
		if( typeof socketId !== 'number' )
		{
			console.log( 'Socket id must be a number!' );
			return false;
		}
		console.log( 'Looking for client with socket id: ' + socketId );
		for( let i = 0 ; i < this.clients.length ; i++ )
		{
			if( this.clients[ i ].socket.id === socketId )
			{
				return i;
			}
		}
		return -1;
	}

	findClientById( id )
	{
		if( !id instanceof Buffer )
		{
			console.log( 'ID must be a buffer!' );
			return false;
		}
		console.log( 'Looking for client with id: ' + id.toString( 'hex' ) );
		for( let i = 0 ; i < this.clients.length ; i++ )
		{
			if( this.clients[ i ].id.compare( id ) === 0 )
			{
				return i;
			}
		}
		return -1;
	}

}

module.exports = ClientsStorage;
