const dgram = require( 'dgram' );
const Instruction = require( './Protocol/Instruction' );
const Parser = require( './Protocol/Parser' );
const SearchEngine = require( './../Utils/SearchEngine' );
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
			console.log( data );
			console.log( rinfo );
			let opcode = data[ 0 ];
			let object = this.parser.decode( Instruction.Map[ opcode ].rule, data );
			let index = SearchEngine.findByUniqueID( this.clients.clients, object.id );
			if( index !== -1 )
			{
				this.clients.clients[ index ][ Instruction.Map[ opcode ].callback ]( rinfo );
			}
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
			if( buffer instanceof Buffer )
			{
				receivers.forEach( ( element ) =>
				{
					console.log( buffer );
					this.server.send( buffer, element.udp.port, element.udp.address );
				} );
			}
		}, 1000 / this.tickrate );
		this.tasks.push( timeout );
	}
}
module.exports = ServerUDP;
