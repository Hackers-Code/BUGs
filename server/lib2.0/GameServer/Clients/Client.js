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
		this.clientsStorage = server.getClientsStorage();
		this.streamParser = new StreamParser();
		this.rinfo = null;
		this.keepAliveUDP = null;
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
			onError : null
		};
	}

	handleData( data, type = Sockets.tcp )
	{
		try
		{
			let buffer;
			if( type === Sockets.tcp )
			{
				if( typeof data !== 'undefined' )
				{
					this.streamParser.appendData( data );
				}
				buffer = this.streamParser.getBuffer();
			}
			else
			{
				buffer = data;
			}
			let decoded = DecodePacket( buffer, type );
			if( decoded === false )
			{
				return;
			}
			if( decoded.instruction.event === 'undefined' )
			{
				this.server.sendServerErrorMessage( this.tcpSocketWrite );
			}
			this.emit( decoded.instruction.event, decoded.object,
				this.respond.bind( this, decoded.instruction.response ) );
			if( type === Sockets.tcp )
			{
				this.streamParser.freeBufferToOffset( decoded.offset );
				this.handleData();
			}
		}
		catch( e )
		{
			let msg;
			let opcode;
			if( e.message === 0xe0 )
			{
				msg = 'Unknown instruction';
				opcode = 0xe0;
			}
			else
			{
				msg = 'Parsing request error';
				opcode = 0xe2;
			}
			this.send( {
				opcode : opcode,
				error : msg
			} );
			if( type === Sockets.tcp )
			{
				this.streamParser.clearBuffer();
			}
		}
	}

	respond( opcode, object, type = Sockets.tcp )
	{
		object.opcode = opcode;
		this.send( object, type );
	}

	send( data, type = Sockets.tcp )
	{
		let encodedPacket = EncodePacket( data );
		if( encodedPacket === false )
		{
			this.server.sendServerErrorMessage( this.tcpSocketWrite );
			return;
		}
		if( type === Sockets.tcp )
		{
			this.tcpSocketWrite( encodedPacket );
		}
		else
		{
			this.udpSocketSend( encodedPacket, this.rinfo.port, this.rinfo.address );
		}
	}

	disconnect()
	{
		if( this.keepAliveUDP !== null )
		{
			clearInterval( this.keepAliveUDP );
			this.clientsStorage.removeClient( this.id );
			this.emit( 'disconnect' );
		}
	}
}

module.exports = Client;
