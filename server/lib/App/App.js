const Logger = require( '../Logger/Logger' );
class App {
	constructor( options )
	{
		this.config = options.config;
		this.startTCP = options.startTCP;
		this.startUDP = options.startUDP;
		this.tcp = null;
		this.udp = null;
		this.logger = new Logger( this.config.logFile, this.config.errorFile );
		this.runTCP();
		this.runUDP();
	}

	runTCP()
	{
		this.startTCP( this.config.TCP_port, ( sendFunc ) =>
		{
			this.logger.log( `Connection from ${socket.remoteAddress}:${socket.remotePort}` );
		}, ( err ) =>
		{
			this.logger.error( err.message );
			this.udp.close();
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
			this.tcp.close();
		}, ( address ) =>
		{
			this.logger.log( `UDP socket listening on ${address.address}:${address.port}` );
		} );
	}
}
module.exports = App;

