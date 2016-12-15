'use strict';
const net = require( 'net' );
const ClientsStorage = require( './ClientsStorage' );
const RoomsStorage = require( './RoomsStorage' );
class Server {
	constructor()
	{
		this.server = net.createServer( this.connectionHandler.bind( this ) )
		.on( 'error', function( err )
		{
			throw err;
		} );
		this.server.listen( {
			host : '0.0.0.0',
			port : 31337
		}, this.displayWelcomeMessage.bind( this ) );
		this.socketID = 0;
		this.roomsStorage = new RoomsStorage();
		this.clientsStorage = new ClientsStorage( this.roomsStorage );
	}

	connectionHandler( socket )
	{
		if( socket instanceof net.Socket )
		{
			socket.id = this.socketID++;
			this.clientsStorage.addClient( socket );
			console.log( `New connection from ${socket.remoteAddress}:${socket.remotePort}, socket id: ${socket.id}` );
		}
		else
		{
			console.log( 'Socket must be an instance of net socket!' );
		}
	}

	displayWelcomeMessage()
	{
		let address = this.server.address();
		console.log( `Listening on ${address.address}:${address.port}` );
	}
}
module.exports = Server;
