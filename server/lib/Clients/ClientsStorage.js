'use strict';
const UniqueKeyGenerator = require( '../Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( '../Utils/UniqueNameStorage' );
const Client = require( './Client' ).Client;
const ClientStatus = require( './Client' ).ClientStatus;
const SearchEngine = require( '../Utils/SearchEngine' );
const PacketEncoder = require( '../Protocol/PacketEncoder' );
const PacketDecoder = require( '../Protocol/PacketDecoder' );
const ServerInstructions = require( '../Protocol/ServerInstructions' );
const ClientInstructions = require( '../Protocol/ClientInstructions' );
class ClientsStorage {

	constructor( maxClients, roomsStorage )
	{
		this.packetEncoder = new PacketEncoder( ServerInstructions );
		this.packetDecoder = new PacketDecoder( ClientInstructions );
		this.maxClients = maxClients;
		this.roomsStorage = roomsStorage;
		this.clients = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
		this.uniqueNameStorage = new UniqueNameStorage( 20, 'Anonymous' );
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

	addClient( write )
	{
		if( this.clients.length >= this.maxClients )
		{
			let error = Buffer.from( 'No empty slots on server' );
			write( this.packetEncoder.encode( {
				opcode : 0x0,
				length : Buffer.from( [ error.length ] ),
				error : error
			} ) );
			return false;
		}
		let id = this.uniqueKeyGenerator.generateKey();
		let client = new Client( write, id, this );
		let index = this.clients.push( client ) - 1;
		this.clients[ index ].sendID();
		return this.clients[ index ].getCallbacks();
	}

	removeClient( id )
	{
		let client = SearchEngine.findByUniqueID( id, this.clients );
		if( client !== false && client !== -1 )
		{
			if( this.clients[ client ].status >= ClientStatus.inGame )
			{
			}
			if( this.clients[ client ].status >= ClientStatus.inLobby )
			{
				this.clients[ client ].leaveRoom();
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

	parseUDP( msg, rinfo, send )
	{
		let decoded = this.packetDecoder.decode( msg );
		if( decoded.instruction.callback === 'setUDP' )
		{
			let index = SearchEngine.findByUniqueID( decoded.object.id, this.clients );
			this.clients[ index ].setUDP( rinfo, send );
			let encoded = this.packetEncoder.encode( { opcode : decoded.instruction.response } );
			send( encoded, rinfo.port, rinfo.address );
		}
		else
		{
			let index = SearchEngine.findByRinfo( rinfo, this.clients );
			this.clients[ index ][ decoded.instruction.callback ]( decoded.object );
		}
	}
}

module.exports = ClientsStorage;
