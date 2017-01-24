'use strict';
const UniqueKeyGenerator = require( '../Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( '../Utils/UniqueNameStorage' );
const Client = require( './Client' ).Client;
const ClientStatus = require( './Client' ).ClientStatus;
const SearchEngine = require( '../Utils/SearchEngine' );
const PacketEncoder = require( '../Protocol/PacketEncoder' );
const ServerInstructions = require( '../Protocol/ServerInstructions' );
class ClientsStorage {
	constructor( maxClients, roomsStorage )
	{
		this.maxClients = maxClients;
		this.roomsStorage = roomsStorage;

		this.packetEncoder = new PacketEncoder( ServerInstructions );
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );

		this.clients = [];
	}

	getUniqueNameStorage()
	{
		return this.uniqueNameStorage;
	}

	getRoomsStorage()
	{
		return this.roomsStorage;
	}

	getClients()
	{
		return this.clients;
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
		let client = new Client( functions, id, this.uniqueNameStorage );
		let index = this.clients.push( client ) - 1;
		return this.clients[ index ].getCallbacks();
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
}

module.exports = ClientsStorage;
