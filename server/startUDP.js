'use strict';
const dgram = require( 'dgram' );
module.exports = ( port, messageHandler, errorHandler, listeningHandler ) =>
{
	let server = dgram.createSocket( 'udp4' );
	server.on( 'message', messageHandler );
	server.on( 'error', errorHandler );
	server.on( 'listening', () =>
	{
		listeningHandler( server.address(), server.send );
	} );
	server.bind( port );
};
