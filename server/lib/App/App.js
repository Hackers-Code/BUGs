const Logger = require( '../Logger/Logger' );
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
		this.logger = new Logger( this.config.logFile, this.config.errorFile );
		this.tasksStorage = new TasksStorage( this.config.tickrate );
		this.roomsStorage = new RoomsStorage();
		this.clientsStorage = new ClientsStorage( this.config.maxClients );
		this.runTCP();
		this.runUDP();
		this.startHTTP();
		this.udpSend = () => {};
	}

	runTCP()
	{
		this.startTCP( this.config.TCP_port, ( address, functions ) =>
		{
			this.logger.log( `Connection from ${address.remoteAddress}:${address.remotePort}` );
			return this.clientsStorage.addClient( functions );
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
		}, ( address, send ) =>
		{
			this.logger.log( `UDP socket listening on ${address.address}:${address.port}` );
			this.udpSend = send;
		} );
	}
}
module.exports = App;

