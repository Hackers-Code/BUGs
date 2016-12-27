const TCP = require( './../Network/ServerTCP' );
const UDP = require( './../Network/ServerUDP' );
const RoomsStorage = require( './../Network/RoomsStorage' );
const ClientsStorage = require( './../Network/ClientsStorage' );
const Logger = require( './Logger' );
const fs = require( 'fs' );
const Indexes = {
	TCP : 0,
	UDP : 1
};
class App {
	constructor()
	{
		try
		{
			this.config = JSON.parse( fs.readFileSync( './config.json' ).toString() );
		}
		catch( e )
		{
			console.log( 'Could not read or parse config file' );
		}
		this.roomsStorage = new RoomsStorage();
		this.clientsStorage = new ClientsStorage();
		this.logger = new Logger( this.config.log_file, this.config.error_file );
		this.servers = [];
	}

	run()
	{
		this.runServer( TCP, this.config.tcp, Indexes.TCP );
		this.runServer( UDP, this.config.udp, Indexes.UDP );
	}

	runServer( type, options, index )
	{
		let server = new Promise( ( resolve, reject ) =>
		{
			this.servers[ index ].socket = new type( reject, options, this.logger );
			this.servers[ index ].lastError = null;
		} );
		server.catch( ( err ) =>
		{
			this.logger.error( err );
			if( err === this.servers[ index ].lastError )
			{
				this.logger.error( 'Server shut down due to infinite loop' );
				return;
			}
			this.servers[ index ].lastError = err;
			this.runServer( type, config, index );
		} );
	}
}
module.exports = App;

