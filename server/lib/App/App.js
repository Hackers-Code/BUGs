const Logger = require( './Logger' );
const ClientsStorage = require( '../Clients/ClientsStorage' );
const RoomsStorage = require( '../Rooms/RoomsStorage' );
const TasksStorage = require( '../Tasks/TasksStorage' );
const net = require( 'net' );
const dgram = require( 'dgram' );
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
		this.tcp.listen( this.config.TCP_port, () =>
		{
			let address = this.tcp.address();
			this.logger.log( `TCP socket listening on ${address.address}:${address.port}` );
		} );
	}

	runUDP()
	{
		this.udp = dgram.createSocket( 'udp4' );
		this.udp.on( 'message', ( msg, rinfo ) =>
		{
			console.log( rinfo );
			console.log( msg );
		} );
		this.udp.on( 'error', ( err ) =>
		{
			this.logger.error( err.message );
		} );
		this.udp.on( 'listening', () =>
		{
			let address = this.udp.address();
			this.logger.log( `UDP socket listening on ${address.address}:${address.port}` );
			this.udpSend = this.udp.send;
		} );
		this.udp.bind( this.config.UDP_port );
	}
}
module.exports = App;

