'use strict';
const dgram = require( 'dgram' );
module.exports = ( port, messageHandler, errorHandler, listeningHandler ) =>
{
	let server = dgram.createSocket( 'udp4' );
	server.on( 'message', ( msg, rinfo ) =>
	{
		let send = server.send.bind( server );
		messageHandler( msg, rinfo, send );
	} );
	server.on( 'error', errorHandler );
	server.on( 'listening', () =>
	{
		listeningHandler( 'UDP', server.address() );
	} );
	server.bind( port );
};
