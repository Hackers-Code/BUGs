const dgram = require( 'dgram' );
class ServerUDP {
	constructor( reject, app )
	{
		this.logger = app.logger;
		this.options = app.config.tcp;
		this.clients = app.clientsStorage;
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
			this.logger.log( `UDP server listening on ${address.address}:${address.port}` );
		} );

		this.server.bind( this.options );
	}
}
module.exports = ServerUDP;
