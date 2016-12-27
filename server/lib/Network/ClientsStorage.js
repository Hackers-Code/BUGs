'use strict';
const UniqueKeyGenerator = require( './../Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( './../Utils/UniqueNameStorage' );
const Client = require( './Client' ).Client;
const ClientStatus = require( './Client' ).ClientStatus;
const SearchEngine = require( './../Utils/SearchEngine' );
class ClientsStorage {
	constructor( app )
	{
		this.app = app;
		this.maxClients = app.config.max_clients;
		this.clients = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
	}

	addClient( socket )
	{
		console.log( 'CONN:' + this.clients.length );
		if( this.clients.length >= this.maxClients )
		{
			return false;
		}
		let id = this.uniqueKeyGenerator.generateKey();
		let client = new Client( socket, id, this.app );
		this.clients.push( client );
		return true;
	}

	removeClient( id )
	{
		let client = SearchEngine.findByUniqueID( this.clients, id );
		if( client !== false && client !== -1 )
		{
			if( this.clients.status >= ClientStatus.inGame )
			{
				if( this.clients.status >= ClientStatus.inLobby )
				{
					this.clients[ client ].leaveLobby();
				}
			}
			if( this.clients.status >= ClientStatus.named )
			{
				this.uniqueNameStorage.removeName( this.clients[ client ].name )
			}
			this.uniqueKeyGenerator.freeKey( this.clients[ client ].id );
			this.clients.splice( client, 1 );
			console.log( 'DISCONN' + this.clients.length );
			return true;
		}
		return false;
	}

	addName( name )
	{
		return this.uniqueNameStorage.addName( name );
	}

	removeName( name )
	{
		return this.uniqueNameStorage.removeName( name );
	}
}

module.exports = ClientsStorage;
