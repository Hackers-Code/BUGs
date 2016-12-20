'use strict';
const UniqueKeyGenerator = require( './../Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( './../Utils/UniqueNameStorage' );
const Client = require( './Client' ).Client;
const ClientStatus = require( './Client' ).ClientStatus;
class ClientsStorage {
	constructor()
	{
		this.clients = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20 );
	}

	addClient( socket )
	{
		let id = this.uniqueKeyGenerator.generateKey();
		let client = new Client( socket, id, this );
		this.clients.push( client );
	}

	removeClient( id )
	{
		let client = this.findClientById( id );
		if( client !== false && client !== -1 )
		{
			if( this.clients.status >= ClientStatus.named )
			{
				this.uniqueNameStorage.removeName( this.clients[ client ].name )
			}
			this.uniqueKeyGenerator.freeKey( this.clients[ client ].id );
			this.clients.splice( client, 1 );
		}
		else
		{
			return false;
		}
	}

	addName( name )
	{
		return this.uniqueNameStorage.addName( name );
	}

	removeName( name )
	{
		return this.uniqueNameStorage.removeName( name );
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
