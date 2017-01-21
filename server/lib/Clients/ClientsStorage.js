'use strict';
const UniqueKeyGenerator = require( '../Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( '../Utils/UniqueNameStorage' );
const Client = require( './Client' ).Client;
const ClientStatus = require( './Client' ).ClientStatus;
const SearchEngine = require( '../Utils/SearchEngine' );
const PacketEncoder = require( '../Protocol/PacketEncoder' );
const ServerInstructions = require( '../Protocol/ServerInstructions' );
class ClientsStorage {
	constructor( maxClients )
	{
		this.packetEncoder = new PacketEncoder( ServerInstructions );
		this.maxClients = maxClients;
		this.clients = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
	}

	addClient( functions )
	{
		if( this.clients.length >= this.maxClients )
		{
			let error = Buffer.from( 'No empty slots on server' );
			functions.end( this.packetEncoder( {
				opcode : 0x0,
				length : Buffer.from( [ error.length ] ),
				error : error
			} ) );
			return false;
		}
		let id = this.uniqueKeyGenerator.generateKey();
		let client = new Client( functions, id );
		this.clients.push( client );
		return this.clients.getCallbacks();
	}

	removeClient( id )
	{
		let client = SearchEngine.findByUniqueID( this.clients, id );
		if( client !== false && client !== -1 )
		{
			if( this.clients[ client ].status >= ClientStatus.inGame )
			{
			}
			if( this.clients[ client ].status >= ClientStatus.inLobby )
			{
				this.clients[ client ].leaveLobby();
			}
			if( this.clients[ client ].status >= ClientStatus.named )
			{
				this.uniqueNameStorage.removeName( this.clients[ client ].name )
			}
			this.uniqueKeyGenerator.freeKey( this.clients[ client ].id );
			this.clients.splice( client, 1 );
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
