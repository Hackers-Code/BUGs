'use strict';
const Sockets = require( '../Protocol/Types' ).Sockets;
const StreamParser = require( './StreamParser' );
const EncodePacket = require( '../Protocol/PacketEncoder' );
const DecodePacket = require( '../Protocol/PacketDecoder' );
const EventEmitter = require( 'events' );
class Client extends EventEmitter {
	constructor( socketWrite, server )
	{
		super();
		this.tcpSocketWrite = socketWrite;
		this.udpSocketSend = null;
		this.server = server;
		this.clientsCollection = server.getClientsCollection();
		this.logger = server.getLogger();
		this.streamParser = new StreamParser();
		this.rinfo = null;
		this.keepAliveUDP = null;
		this.id = null;
	}

	getRinfo()
	{
		return this.rinfo;
	}

	assignUDPSocket( rinfo, udpSocketSend )
	{
		this.rinfo = rinfo;
		this.udpSocketSend = udpSocketSend;
		this.send( { opcode : 0x7 }, Sockets.udp );
		this.keepAliveUDP = setInterval( () =>
		{
			this.send( { opcode : 0x8 }, Sockets.udp );
		}, 15000 );
	}

	setId( id )
	{
		this.id = id;
		this.send( {
			opcode : 0x5,
			id : this.id
		} );
	}

	getCallbacks()
	{
		return {
			onData : this.handleData.bind( this ),
			onClose : this.disconnect.bind( this ),
			onError : () => {}
		};
	}

	handleData( data, type = Sockets.tcp )
	{
		let buffer;
		if( type !== Sockets.tcp )
		{
			buffer = data;
		}
		else
		{
			if( typeof data !== 'undefined' )
			{
				this.streamParser.appendData( data );
			}
			buffer = this.streamParser.getBuffer();
		}
		let decoded = DecodePacket( buffer, type );
		if( decoded.success === false )
		{
			if( decoded.error === 0xe0 )
			{
				this.send( {
					opcode : 0xe0,
					error : 'Unknown opcode'
				} );
				if( type === Sockets.tcp )
				{
					this.streamParser.clearBuffer();
				}
			}
			return;
		}
		if( decoded.result.instruction.event === 'undefined' )
		{
			this.server.sendServerErrorMessage( this.tcpSocketWrite,
				`No event is specified for instruction ${decoded.result.instruction.opcode}` );
		}
		else
		{
			let hasListeners;
			if( decoded.result.instruction.response )
			{
				hasListeners = this.emit( decoded.result.instruction.event, decoded.result.object,
					this.respond.bind( this, decoded.result.instruction.response ) );
			}
			else
			{
				hasListeners = this.emit( decoded.result.instruction.event, decoded.result.object );
			}
			if( hasListeners === false )
			{
				this.server.sendServerErrorMessage( this.tcpSocketWrite,
					`No listener for event ${decoded.result.instruction.event}` );
				this.emit( 'error', new Error( `No listener for event ${decoded.result.instruction.event}` ) );
			}
		}
		if( type === Sockets.tcp )
		{
			this.streamParser.freeBufferToOffset( decoded.result.offset );
			this.handleData();
		}
	}

	respond( opcode, object, type = Sockets.tcp )
	{
		object.opcode = opcode;
		this.send( object, type );
	}

	send( data, type = Sockets.tcp )
	{
		let encodedPacket = EncodePacket( data, type );
		if( encodedPacket.success === false )
		{
			this.server.sendServerErrorMessage( this.tcpSocketWrite, `Could not encode packet: ${data.opcode}` );
			return;
		}
		if( type === Sockets.tcp )
		{
			this.tcpSocketWrite( encodedPacket.result );
		}
		else
		{
			this.udpSocketSend( encodedPacket.result, this.rinfo.port, this.rinfo.address );
		}
	}

	disconnect()
	{
		if( this.keepAliveUDP !== null )
		{
			clearInterval( this.keepAliveUDP );
			this.clientsCollection.removeClient( this.id );
			this.emit( 'disconnect' );
		}
	}
}

module.exports = Client;
