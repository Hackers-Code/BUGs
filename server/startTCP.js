'use strict';
const net = require( 'net' );
module.exports = ( port, connectionHandler, errorHandler, listeningHandler ) =>
{
	let server = net.createServer( ( socket ) =>
	{
		let socketCallbacks = connectionHandler( {
			remoteAddress : socket.remoteAddress,
			remotePort : socket.remotePort
		}, {
			write : socket.write.bind( socket ),
			end : socket.end.bind( socket )
		} );
		socket.on( 'data', socketCallbacks.onData );
		socket.on( 'close', socketCallbacks.onClose );
	} ).on( 'error', errorHandler );
	server.listen( port, () =>
	{
		listeningHandler( server.address() )
	} );
};
