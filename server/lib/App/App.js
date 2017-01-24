const Logger = require( './Logger' );
const ClientsStorage = require( '../Clients/ClientsStorage' );
const RoomsStorage = require( '../Rooms/RoomsStorage' );
const TasksStorage = require( '../Tasks/TasksStorage' );
const net = require( 'net' );
class App {
	constructor( options )
	{
		this.config = options.config;
		this.startHTTP = options.httpStart;
		this.logger = new Logger( this.config.logFile, this.config.errorFile );
		this.tasksStorage = new TasksStorage( this.config.tickrate );
		this.roomsStorage = new RoomsStorage();
		this.clientsStorage = new ClientsStorage( this.config.maxClients, this.roomsStorage );
		this.runTCP();
		this.runUDP();
		this.startHTTP();
		this.udpSend = () => {};
	}

	runTCP()
	{
		this.tcp = net.createServer( ( socket ) =>
		{
			let ip = socket.remoteAddress;
			let port = socket.remotePort;
			this.logger.log( `Connection from ${ip}:${port}` );
			this.clientsStorage.addClient( socket );
		} ).on( 'error', ( err ) =>
		{
			this.logger.error( err.message );
		} );
		server.listen( this.config.TCP_port, () =>
		{
			let address = server.address();
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
		}, ( address, send ) =>
		{
			this.logger.log( `UDP socket listening on ${address.address}:${address.port}` );
			this.udpSend = send;
		} );
	}
}
module.exports = App;

