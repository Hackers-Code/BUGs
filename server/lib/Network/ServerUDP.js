const dgram = require( 'dgram' );
class ServerUDP {
	constructor( port )
	{
		this.server = dgram.createSocket( 'udp4' );
		this.server.bind( port );
		this.server.on( 'message', ( data, rinfo ) =>
		{
			console.log( rinfo );
			this.server.send( Buffer.from( '00010101', 'hex' ), rinfo.port, rinfo.address );
		} );
	}
}
module.exports = ServerUDP;
