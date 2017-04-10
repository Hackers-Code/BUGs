'use strict';
const GameServer = require( './GameServer' );
const TCP_PORT = 31337;
const UDP_PORT = 31337;
const MAX_CLIENTS = 8;
module.exports = ( options ) =>
{
	let tcpPort = options.tcpPort || TCP_PORT;
	let udpPort = options.udpPort || UDP_PORT;
	let maxClients = options.maxClients || MAX_CLIENTS;

	return new GameServer( tcpPort, udpPort, maxClients );
};
