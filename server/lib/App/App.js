const TCP = require( './../Network/ServerTCP' );
const UDP = require( './../Network/ServerUDP' );
const RoomsStorage = require( './../Network/RoomsStorage' );
const ClientsStorage = require( './../Network/ClientsStorage' );
const Logger = require( './Logger' );
const ConfigManager = require( './ConfigManager' );
class App {
	constructor()
	{
		let readConfig = new Promise( ConfigManager.read );
		readConfig.then( ( data ) =>
		{
			try
			{
				this.config = JSON.parse( data.toString() );
				this.init();
			}
			catch( err )
			{
				console.log( 'Could not parse config file' );
				console.log( 'Error: ' + err.message )
			}
		} ).catch( ( err ) =>
		{
			console.log(
				'Could not read config file, if you run this server for the first time remember to execute init.js first' );
			console.log( 'Error: ' + err.message );
		} );
	}

	init()
	{
		this.roomsStorage = new RoomsStorage( this );
		this.clientsStorage = new ClientsStorage( this );
		this.logger = new Logger( this.config.log_file, this.config.error_file );
		this.tcp = {
			socket : null,
			lastError : null
		};
		this.udp = {
			socket : null,
			lastError : null
		};
		this.runTCP();
		this.runUDP();
	}

	runTCP()
	{
		let tcp = new Promise( ( resolve, reject ) =>
		{
			this.tcp.socket = new TCP( reject, this );
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
			this.udp.socket = new UDP( reject, this );
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

