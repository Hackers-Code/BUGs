const dgram = require( 'dgram' );
class ServerUDP {
	constructor( reject, options, logger )
	{
		this.server = dgram.createSocket( 'udp4' );
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
			logger.log( `UDP server listening on ${address.address}:${address.port}` );
		} );

		this.server.bind( options.port );
	}
}
module.exports = ServerUDP;
