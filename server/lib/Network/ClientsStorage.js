'use strict';
const UniqueKeyGenerator = require( './../Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( './../Utils/UniqueNameStorage' );
const Client = require( './Client' ).Client;
const ClientStatus = require( './Client' ).ClientStatus;
const SearchEngine = require( './../Utils/SearchEngine' );
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
		let id = this.uniqueKeyGenerator.generateKey();
		let client = new Client( socket, id, this );
		this.clients.push( client );
	}

	removeClient( id )
	{
		let client = SearchEngine.findByUniqueID( this.clients, id );
		if( client !== false && client !== -1 )
		{
			if( this.clients.status >= ClientStatus.inLobby )
			{
				this.clients[ client ].leaveLobby();
			}
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

}

module.exports = ClientsStorage;
