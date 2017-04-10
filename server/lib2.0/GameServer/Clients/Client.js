'use strict';
const StreamParser = require( './StreamParser' );
const EncodePacket = require( '../Protocol/PacketEncoder' );
const DecodePacket = require( '../Protocol/PacketDecoder' );
class Client {
	constructor( socketWrite, server, clientsStorage )
	{
		this.tcpSocketWrite = socketWrite;
		this.server = server;
		this.uniqueNameStorage = clientsStorage.getUniqueNameStorage();
		this.streamParser = new StreamParser();
		this.name = this.uniqueNameStorage.getDefault();
	}

	setId( id )
	{
		this.id = id;
	}

	getCallbacks()
	{
		return {
			onData : this.handleData.bind( this ),
			onClose : this.disconnect.bind( this ),
			onError : null
		};
	}

	handleData( data )
	{
		if( typeof data !== 'undefined' )
		{
			this.streamParser.appendData( data );
		}
		try
		{
			let buffer = this.streamParser.getBuffer();
			let decoded = DecodePacket( buffer );
			console.log( decoded );
			if( decoded === false )
			{
				return;
			}
			this.streamParser.freeBufferToOffset( decoded.offset );
			//this.respond( decoded.instruction, decoded.object );
			this.handleData();
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
			this.streamParser.clearBuffer();
		}
	}

	send( data, type = 'TCP' )
	{
		let encodedPacket = EncodePacket( data );
		if( encodedPacket === false )
		{
			this.server.sendServerErrorMessage( this.tcpSocketWrite );
			return;
		}
		if( type === 'TCP' )
		{
			this.tcpSocketWrite( encodedPacket );
		}
		else
		{
			//this.udpSend( encoded, this.rinfo.port, this.rinfo.address );
		}
	}

	disconnect()
	{
		/*if( this.keepAliveUDP !== null )
		 {
		 clearInterval( this.keepAliveUDP );
		 }
		 this.clientsStorage.removeClient( this.id );*/
	}
}

module.exports = Client;
