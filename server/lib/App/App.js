const TCP = require( './../Network/ServerTCP' );
const UDP = require( './../Network/ServerUDP' );
const RoomsStorage = require( './../Network/RoomsStorage' );
const ClientsStorage = require( './../Network/ClientsStorage' );
const fs = require( 'fs' );
class App {
	constructor()
	{
		this.log = './logs/log.txt';
		this.error = './logs/error.txt';
		this.roomsStorage = new RoomsStorage();
		this.clientsStorage = new ClientsStorage();
		this.udp = null;
		this.lastErrorUDP = null;
		this.tcp = null;
		this.lastErrorTCP = null;
	}

	run()
	{
		this.runTCP();
		this.runUDP();
	}

	runTCP()
	{
		fs.appendFile( this.log, 'Running TCP server\n', () =>
		{
		} );
		let tcp = new Promise( ( resolve, reject ) =>
		{
			this.tcp = new TCP( reject, { port : 31337 } );
		} );
		tcp.catch( ( err ) =>
		{
			fs.appendFile( this.error, err + '\n', () =>
			{
			} );
			if( err === this.lastErrorTCP )
			{
				fs.appendFile( this.error, 'Server shut down due to infinite loop\n', () =>
				{
				} );
				return;
			}
			this.lastErrorTCP = err;
			this.runTCP();
		} );
	}

	runUDP()
	{
		fs.appendFile( this.log, 'Running UDP server\n', () =>
		{
		} );
		let udp = new Promise( ( resolve, reject ) =>
		{
			this.udp = new UDP( reject, { port : 31337 } );
		} );
		udp.catch( ( err ) =>
		{
			fs.appendFile( this.error, err + '\n', () =>
			{
			} );
			if( err === this.lastErrorUDP )
			{
				fs.appendFile( this.error, 'Server shut down due to infinite loop\n', () =>
				{
				} );
				return;
			}
			this.lastErrorUDP = err;
			this.runUDP();
		} );
	}
}
module.exports = App;

