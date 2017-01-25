const Logger = require( './Logger' );
const ClientsStorage = require( '../Clients/ClientsStorage' );
const RoomsStorage = require( '../Rooms/RoomsStorage' );
const TasksStorage = require( '../Tasks/TasksStorage' );
class App {
	constructor( options )
	{
		this.config = options.config;
		this.startTCP = options.tcpStart;
		this.startUDP = options.udpStart;
		this.startHTTP = options.httpStart;
		this.runTCP();
		this.runUDP();
		this.logger = new Logger( this.config.logFile, this.config.errorFile );
		this.tasksStorage = new TasksStorage( this.config.tickrate );
		this.roomsStorage = new RoomsStorage( this.logger, this.tasksStorage );
		this.clientsStorage = new ClientsStorage( this.config.maxClients, this.roomsStorage );
		this.startHTTP();
	}

	runTCP()
	{
		this.startTCP( this.config.TCP_port, ( address, write ) =>
		{
			this.logger.log( `Connection from ${address.remoteAddress}:${address.remotePort}` );
			return this.clientsStorage.addClient( write );
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
		this.startUDP( this.config.UDP_port, ( msg, rinfo, send ) =>
		{
			this.clientsStorage.parseUDP( msg, rinfo, send );
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

