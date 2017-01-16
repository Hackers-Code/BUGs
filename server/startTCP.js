'use strict';
const net = require( 'net' );
module.exports = ( port, connectionHandler, errorHandler, listeningHandler ) =>
{
	let server = net.createServer( ( socket ) =>
	{
		let socketCallbacks = connectionHandler( socket.write, socket.end );
		socket.on( 'data', socketCallbacks.onData );
		socket.on( 'close', socketCallbacks.onClose );
	} ).on( 'error', errorHandler );
	server.listen( port, () =>
	{
		listeningHandler( server.address() )
	} );
};
