const dgram = require( 'dgram' );
const Instruction = require( './Protocol/Instruction' );
const Parser = require( './Protocol/Parser' );
class ServerUDP {
	constructor( reject, app )
	{
		this.logger = app.logger;
		this.options = app.config.tcp;
		this.clients = app.clientsStorage;
		this.server = dgram.createSocket( 'udp4' );
		this.tasks = [];
		this.tickrate = 16;
		this.parser = new Parser( 'opcode:1' );
		this.server.on( 'message', ( data, rinfo ) =>
		{

		} );
		this.server.on( 'error', ( err ) =>
		{
			reject( err.message );
		} );
		this.server.on( 'listening', () =>
		{
			let address = this.server.address();
			this.logger.log( `UDP server listening on ${address.address}:${address.port}` );
		} );

		this.server.bind( this.options );
	}

	addTask( receivers, func )
	{
		let timeout = setInterval( () =>
		{
			let msg = func();
			let opcode = msg.opcode;
			msg.opcode = Buffer.from( [ opcode ] );
			let buffer = this.parser.encode( Instruction.Map[ opcode ].rule, msg );
			console.log( Instruction.Map[ opcode ].rule );
			console.log( buffer );
			console.log( msg );
			if( buffer instanceof Buffer )
			{
				receivers.forEach( ( element ) =>
				{
					this.server.send( buffer, element.port, element.ip );
				} );
			}
		}, 1000 / this.tickrate );
		this.tasks.push( timeout );
	}
}
module.exports = ServerUDP;
