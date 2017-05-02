'use strict';
const EncodePacket = require( './Protocol/PacketEncoder' );
const ClientsCollection = require( './Clients/ClientsCollection' );
const startTCP = require( './tcp' );
const startUDP = require( './udp' );
const EventEmitter = require( 'events' );
const TCP_PORT = 31337;
const UDP_PORT = 31337;
const MAX_CLIENTS = 8;
class GameServer extends EventEmitter {
	constructor( logger, options )
	{
		super();
		let maxClients = options.maxClients || MAX_CLIENTS;
		this.clientsCollection = new ClientsCollection();
		this.logger = logger;
		startTCP( TCP_PORT, this.handleTCPConnection.bind( this ), this.handleError.bind( this ),
			this.handleListening.bind( this ) );
		startUDP( UDP_PORT, this.handleUDPPacket.bind( this ), this.handleError.bind( this ),
			this.handleListening.bind( this ) );
	}

	getClientsCollection()
	{
		return this.clientsCollection;
	}

	sendServerErrorMessage( socketWrite, error )
	{
		this.logger.error( `Internal server error occurred. Message: ${error}` );
		let encodedPacket = EncodePacket( {
			opcode : 0xe2,
			error : 'Internal server error'
		} );
		if( encodedPacket.success === false )
		{
			this.logger.error( `Server was unable to form error message packet: ${encodedPacket.error}` );
			return;
		}
		socketWrite( encodedPacket.result );
	}

	sendKickMessage( socketWrite )
	{
		let encodedPacket = EncodePacket( {
			opcode : 0x00,
			error : 'No free slots on server'
		} );
		if( encodedPacket.success === false )
		{
			this.sendServerErrorMessage( socketWrite, `Could not encode 'no free slots' packet` );
			return;
		}
		socketWrite( encodedPacket.result );
	}

	handleTCPConnection( address, socketWrite )
	{
		this.logger.log( `Connection from ${address.remoteAddress}:${address.remotePort}` );
		if( this.clientsCollection.getClientsCount() === this.maxClients )
		{
			this.sendKickMessage( socketWrite );
			return false;
		}
		let client = this.clientsCollection.addClient( socketWrite, this );
		this.emit( 'connection', client );
		return client.getCallbacks();
	}

	handleUDPPacket( packet, rinfo, socketSend )
	{
		this.clientsCollection.passUDPPacket( packet, rinfo, socketSend );
	}

	handleError( error )
	{
		this.logger.error( error.message );
	}

	handleListening( type, address )
	{
		this.logger.log( `${type} socket listening on ${address.address}:${address.port}` );
	}

}
module.exports = GameServer;
