const TCP = require( './../Network/ServerTCP' );
const UDP = require( './../Network/ServerUDP' );
const RoomsStorage = require( './../Network/RoomsStorage' );
const ClientsStorage = require( './../Network/ClientsStorage' );
const Logger = require( './Logger' );
const fs = require( 'fs' );
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
		this.tcp = {
			socket : null,
			lastError : null
		};
		this.udp = {
			socket : null,
			lastError : null
		};
	}

	run()
	{
		this.runTCP();
		this.runUDP();
	}

	runTCP()
	{
		let tcp = new Promise( ( resolve, reject ) =>
		{
			this.tcp.socket = new TCP( reject, this.config.tcp, this.logger );
		} );
		tcp.catch( ( err ) =>
		{
			this.logger.error( err );
			if( err === this.tcp.lastError )
			{
				this.logger.error( 'Server shut down due to infinite loop' );
				return;
			}
			this.tcp.lastError = err;
			this.runTCP();
		} );
	}

	runUDP()
	{
		let udp = new Promise( ( resolve, reject ) =>
		{
			this.udp.socket = new UDP( reject, this.config.udp, this.logger );
		} );
		udp.catch( ( err ) =>
		{
			this.logger.error( err );
			if( err === this.tcp.lastError )
			{
				this.logger.error( 'Server shut down due to infinite loop' );
				return;
			}
			this.udp.lastError = err;
			this.runUDP();
		} );
	}
}
module.exports = App;

