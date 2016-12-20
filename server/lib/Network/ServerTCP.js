const net = require( 'net' );
const ClientsStorage = require( './ClientsStorage' );
const RoomsStorage = require( './RoomsStorage' );
class ServerTCP {
	constructor( options )
	{
		this.clientsStorage = new ClientsStorage();
		this.server = net.createServer( ( socket ) =>
		{
			this.clientsStorage.addClient( socket );
		} ).on( 'error', ( err ) =>
		{
			throw err;
		} );
		this.server.listen( options );
	}
}
module.exports = ServerTCP;
