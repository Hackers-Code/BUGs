const net = require( 'net' );
class ServerTCP {
	constructor( reject, options, logger )
	{
		this.server = net.createServer( ( socket ) =>
		{
			logger.log( `New TCP connection from ${socket.remoteAddress}:${socket.remotePort}` );
		} ).on( 'error', ( err ) =>
		{
			reject( err.message );
		} );
		this.server.listen( options, () =>
		{
			let address = this.server.address();
			logger.log( `TCP server listening on ${address.address}:${address.port}` );
		} );
	}
}
module.exports = ServerTCP;
