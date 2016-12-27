const net = require( 'net' );
const Response = require( './Response' );
class ServerTCP {
	constructor( reject, app )
	{
		this.logger = app.logger;
		this.options = app.config.tcp;
		this.clients = app.clientsStorage;
		this.server = net.createServer( ( socket ) =>
		{
			this.logger.log( `New TCP connection from ${socket.remoteAddress}:${socket.remotePort}` );
			if( !this.clients.addClient( socket ) )
			{
				let response = new Response( socket );
				let error = 'All slots on server are reserved. Please try again later';
				response.send( {
					opcode : 0xe2,
					length : Buffer.from( [ error.length ] ),
					error : Buffer.from( error )
				} );
			}
		} ).on( 'error', ( err ) =>
		{
			reject( err.message );
		} );
		this.server.listen( this.options, () =>
		{
			let address = this.server.address();
			this.logger.log( `TCP server listening on ${address.address}:${address.port}` );
		} );
	}
}
module.exports = ServerTCP;
