'use strict';
const EncodePacket = require( './Protocol/PacketEncoder' );
const ClientsStorage = require( './Clients/ClientsStorage' );
const startTCPSocket = require( './tcpSocket' );
const startUDPSocket = require( './udpSocket' );
const Logger = require( './Logger' );
class GameServer {
	constructor( tcpPort, udpPort, maxClients )
	{
		this.logger = new Logger();
		this.clientsStorage = new ClientsStorage();
		this.maxClients = maxClients;
		startTCPSocket( tcpPort, this.handleTCPConnection.bind( this ), this.handleError.bind( this ),
			this.handleListening.bind( this ) );
		startUDPSocket( udpPort, this.handleUDPPacket.bind( this ), this.handleError.bind( this ),
			this.handleListening.bind( this ) );
	}

	handleTCPConnection( address, socketWrite )
	{
		this.logger.log( `Connection from ${address.remoteAddress}:${address.remotePort}` );
		if( this.clientsStorage.getClientsCount() === this.maxClients )
		{
			socketWrite( EncodePacket( {
				opcode : 0,
				reason : 'No free slots on server'
			} ) );
			return false;
		}
		return this.clientsStorage.addClient( socketWrite );
	}

	handleUDPPacket( packet, rinfo, socketSend )
	{

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
