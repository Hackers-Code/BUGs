'use strict';
const net = require( 'net' );
module.exports = ( port, connectionHandler, errorHandler, listeningHandler ) =>
{
	let server = net.createServer( ( socket ) =>
	{
		let socketCallbacks = connectionHandler( {
			remoteAddress : socket.remoteAddress,
			remotePort : socket.remotePort
		}, socket.write.bind( socket ) );
		if( socketCallbacks !== false )
		{
			socket.on( 'data', socketCallbacks.onData );
			socket.on( 'error', () => {} );
			socket.on( 'close', socketCallbacks.onClose );
		}
		socket.end();
	} ).on( 'error', errorHandler );
	server.listen( port, () =>
	{
		listeningHandler( server.address() )
	} );
};
