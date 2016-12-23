'use strict';
const Instruction = require( './Protocol/Instruction' );
const Parser = require( './Protocol/Parser' );
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
			this.socket.write( buffer );
		}
		else
		{
			this.socket.write( Buffer.from( [ 0xe2, 0 ] ) );
		}
	}
}

module.exports = Response;
