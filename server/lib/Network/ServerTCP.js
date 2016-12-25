const net = require( 'net' );
class ServerTCP {
	constructor( reject, options )
	{
		this.server = net.createServer( ( socket ) =>
		{

		} ).on( 'error', ( err ) =>
		{
			reject( err.message );
		} );
		this.server.listen( options );
	}
}
module.exports = ServerTCP;
