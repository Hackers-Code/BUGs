const Logger = require( '../Logger/Logger' );
class App {
	constructor( options )
	{
		this.config = options.config;
		console.log( this.config.mapsList );
		this.startTCP = options.tcpStart;
		this.startUDP = options.udpStart;
		this.startHTTP = options.httpStart;
		this.logger = new Logger( this.config.logFile, this.config.errorFile );
		this.runTCP();
		this.runUDP();
		this.startHTTP();
	}

	runTCP()
	{
		this.startTCP( this.config.TCP_port, ( address, write, end ) =>
		{
			this.logger.log( `Connection from ${address.remoteAddress}:${address.remotePort}` );
		}, ( err ) =>
		{
			this.logger.error( err.message );
		}, ( address ) =>
		{
			this.logger.log( `TCP socket listening on ${address.address}:${address.port}` );
		} );
	}

	runUDP()
	{
		this.startUDP( this.config.UDP_port, ( msg, rinfo ) =>
		{
			console.log( rinfo );
			console.log( msg );
		}, ( err ) =>
		{
			this.logger.error( err.message );
		}, ( address ) =>
		{
			this.logger.log( `UDP socket listening on ${address.address}:${address.port}` );
		} );
	}
}
module.exports = App;

