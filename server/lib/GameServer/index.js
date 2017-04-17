'use strict';
const EncodePacket = require( './Protocol/PacketEncoder' );
const ClientsCollection = require( './Clients/ClientsCollection' );
const startTCPSocket = require( './tcpSocket' );
const startUDPSocket = require( './udpSocket' );
const EventEmitter = require( 'events' );
const TCP_PORT = 31337;
const UDP_PORT = 31337;
const MAX_CLIENTS = 8;
class GameServer extends EventEmitter {
	constructor( logger, options )
	{
		super();
		let tcpPort = options.tcpPort || TCP_PORT;
		let udpPort = options.udpPort || UDP_PORT;
		let maxClients = options.maxClients || MAX_CLIENTS;
		this.clientsCollection = new ClientsCollection();
		this.logger = logger;
		startTCPSocket( tcpPort, this.handleTCPConnection.bind( this ), this.handleError.bind( this ),
			this.handleListening.bind( this ) );
		startUDPSocket( udpPort, this.handleUDPPacket.bind( this ), this.handleError.bind( this ),
			this.handleListening.bind( this ) );
	}

	getClientsCollection()
	{
		return this.clientsCollection;
	}

	getLogger()
	{
		return this.logger;
	}

	sendServerErrorMessage( socketWrite )
	{
		let encodedPacket = EncodePacket( {
			opcode : 0xe2,
			error : 'Internal server error'
		} );
		if( encodedPacket === false )
		{
			this.logger.error( `Server was unable to form error message packet` );
			return;
		}
		socketWrite( encodedPacket );
	}

	sendKickMessage( socketWrite )
	{
		let encodedPacket = EncodePacket( {
			opcode : 0x00,
			error : 'No free slots on server'
		} );
		if( encodedPacket === false )
		{
			this.sendServerErrorMessage( socketWrite );
			return;
		}
		socketWrite( encodedPacket );
	}

	handleTCPConnection( address, socketWrite )
	{
		this.logger.log( `Connection from ${address.remoteAddress}:${address.remotePort}` );
		if( this.clientsStorage.getClientsCount() === this.maxClients )
		{
			this.sendKickMessage( socketWrite );
			return false;
		}
		let client = this.clientsStorage.addClient( socketWrite, this );
		this.emit( 'connection', client );
		return client.getCallbacks();
	}

	handleUDPPacket( packet, rinfo, socketSend )
	{
		this.clientsStorage.passUDPPacket( packet, rinfo, socketSend );
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
