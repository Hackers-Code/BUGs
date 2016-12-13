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
		console.log( 'Sending data : ' + buffer.toString( 'hex' ) );
		this.socket.write( buffer );
	}
}

module.exports = Response;
