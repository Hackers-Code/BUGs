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
		if( typeof socketCallbacks === 'object' )
		{
			if( typeof socketCallbacks.onData === 'function' )
			{
				socket.on( 'data', socketCallbacks.onData );
			}
			if( typeof socketCallbacks.onClose === 'function' )
			{
				socket.on( 'close', socketCallbacks.onClose );
			}
			if( typeof socketCallbacks.onError === 'function' )
			{
				socket.on( 'error', socketCallbacks.onError );
			}
		}
		else
		{
			socket.end();
		}
	} ).on( 'error', errorHandler );
	server.listen( port, () =>
	{
		listeningHandler( server.address() )
	} );
};
