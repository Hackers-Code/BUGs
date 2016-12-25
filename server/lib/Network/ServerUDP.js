const dgram = require( 'dgram' );
class ServerUDP {
	constructor( reject, options )
	{
		this.server = dgram.createSocket( 'udp4' );
		this.server.on( 'message', ( data, rinfo ) =>
		{

		} );
		this.server.on( 'error', ( err ) =>
		{
			reject( err.message );
		} );
		this.server.bind( options.port );
	}
}
module.exports = ServerUDP;
