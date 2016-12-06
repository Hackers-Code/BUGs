const net = require( 'net' );
const Rooms = require( './Rooms.js' );
const Players = require( './Players.js' );
const Parser = require( './Parser.js' );

class Server {
	constructor()
	{
		this.server = net.createServer( this.connectionHandler.bind( this ) )
		.on( 'error', this.serverErrorHandler.bind( this ) );
		this.server.listen( { host : '0.0.0.0', port : 31337 }, this.displayWelcomeMessage.bind( this ) );
		this.players = new Players();
		this.rooms = new Rooms();
		this.parser = new Parser();
		this.socketID = 0;
	}

	connectionHandler( socket )
	{
		console.log( 'New connection' );
		socket.id = this.socketID++;
		this.players.addPlayer( socket );
		socket.on( 'data', function( data )
		{
			let opcode = data[ 0 ];
			console.log( 'socket ' + socket.id + ' sent opcode: ' + opcode );
			console.log( 'raw data: ' );
			console.log( data );
			switch( opcode )
			{
				case 0:

					this.closeConnection( socket );
					break;
				case 1:
					this.generateAndSendID( socket );
					break;
				case 3:
					this.assignNickname( socket, data );
					break;
				case 5:
					this.listGames( socket );
					break;
				case 7:
					this.createRoom( socket, data );
					break;
			}

		}.bind( this ) );
		socket.on( 'error', function( e )
		{
			console.log( e );
		} );
		socket.on( 'close', function()
		{
			console.log( 'Disconnected' );
		} );
		console.log( socket.remoteAddress );

	}

	serverErrorHandler( err )
	{
		throw err;
	}

	displayWelcomeMessage()
	{
		console.log( this.server.address() );
	}

	closeConnection( socket )
	{
		socket.end();
	}

	sendResponse( socket, opcode, params )
	{
		let response = Buffer.from( [ opcode ] );
		if( params instanceof Buffer )
		{
			response = Buffer.concat( [
				response,
				params
			] );
		}
		else if( typeof params === 'number' )
		{
			response = Buffer.concat( [
				response,
				Buffer.from( [ params ] )
			] );
		}
		console.log( 'Sending to socket with id: ' + socket.id );
		console.log( response );
		socket.write( response );
	}

	generateAndSendID( socket )
	{
		this.sendResponse( socket, 0x2, this.players.addId( socket.id ) );
	}

	assignNickname( socket, data )
	{
		let id = data.slice( 1, 4 );
		let nickName = data.slice( 5, 25 );
		if( this.players.addNickname( nickName, id ) )
		{
			this.sendResponse( socket, 0x4, 1 );
		}
		else
		{
			this.sendResponse( socket, 0x4, 0 );
		}
	}

	createRoom( socket, data )
	{
		let id = data.slice( 1, 4 );
		let roomName = data.slice( 5, 25 );
		if( this.rooms.addRoom( roomName, id ) )
		{
			this.sendResponse( socket, 0x8, 1 );
		}
		else
		{
			this.sendResponse( socket, 0x8, 0 );
		}
	}

	listGames( socket )
	{
		console.log( 'Listing games for ' + socket.id );
		this.rooms.addRoom(Buffer.from([65,65,65,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]),Buffer.from([0x5,0x5,0x5,0x5]));
		this.sendResponse( socket, 0x6, this.rooms.getRooms() );
	}
}

module.exports = Server;