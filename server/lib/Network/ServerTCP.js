'use strict';
const net = require( 'net' );
module.exports = ( port, connectionHandler, errorHandler, listeningHandler ) =>
{
	let server = net.createServer( connectionHandler ).on( 'error', errorHandler );
	server.listen( port, listeningHandler );
	return server;
};
