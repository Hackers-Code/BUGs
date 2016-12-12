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
		socket.id = this.socketID++;
		this.clientsStorage.addClient( socket );
		console.log( 'New connection from ' + socket.remoteAddress + ', socket id: ' + socket.id );
	}

	displayWelcomeMessage()
	{
		console.log( 'Listening on ' + this.server.address().address + ':' + this.server.address().port );
	}
}

new Server();
