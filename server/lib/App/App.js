const TCP = require( './../Network/ServerTCP' );
const UDP = require( './../Network/ServerUDP' );
const RoomsStorage = require( './../Network/RoomsStorage' );
const ClientsStorage = require( './../Network/ClientsStorage' );
const Logger = require( './Logger' );
class App {
	constructor( config )
	{
		this.config = config;
		this.roomsStorage = new RoomsStorage( this );
		this.clientsStorage = new ClientsStorage( this );
		this.tcp = null;
		this.udp = null;
		this.logger = new Logger( this.config.logFile, this.config.errorFile );
	}

	runTCP()
	{
		this.tcp = TCP( this.config.TCP_port, ( socket ) =>
		{
			this.logger.log( `Connection from ${socket.remoteAddress}:${socket.remotePort}` );
			this.clientsStorage.addClient( socket );
		}, ( err ) =>
		{
			this.logger.error( err.message );
			this.udp.close();
		}, () =>
		{
			let address = this.tcp.address();
			this.logger.log( `TCP socket listening on ${address.address}:${address.port}` );
		} );
	}

	runUDP()
	{
		this.udp = UDP( this.config.UDP_port, ( rinfo, data ) =>
		{
			console.log( 'message' );
			console.log( rinfo );
			console.log( data );
		}, ( err ) =>
		{
			this.logger.error( err.message );
			this.tcp.close();
		}, () =>
		{
			let address = this.udp.address();
			this.logger.log( `UDP socket listening on ${address.address}:${address.port}` );
		} );
	}
}
module.exports = App;

