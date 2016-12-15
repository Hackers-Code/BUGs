'use strict';
const Instruction = require( './Instruction' );
const Parser = require( './Parser' );
class Response {
	constructor( socket )
	{
		this.parser = new Parser( 'opcode:1' );
		this.socket = socket;
	}

	send( data )
	{
		let opcode = data.opcode;
		data.opcode = Buffer.from( [ opcode ] );
		let buffer = this.parser.encode( Instruction.Map[ opcode ].rule, data );
		if( buffer !== false )
		{
			console.log( `[${this.socket.remoteAddress}:${this.socket.remotePort}] Sending data to:${buffer.toString(
				'hex' )}` );
			this.socket.write( buffer );
		}
		else
		{
			console.log( `[${this.socket.remoteAddress}:${this.socket.remotePort}] Sending data : 0xe2` );
			this.socket.write( Buffer.from( [ 0xe2 ] ) );
		}
	}
}

module.exports = Response;
