const net = require( 'net' );
const Rooms = require( './Rooms.js' );
const Players = require( './Players.js' );
const Parser = require( './Parser.js' );
const Map = require( './Map.js' );
class Server {
	constructor()
	{
		this.server = net.createServer( this.connectionHandler.bind( this ) )
		.on( 'error', function( err )
		{
			throw err;
		} );
		this.server.listen( {
			host : '0.0.0.0',
			port : 31337
		}, this.displayWelcomeMessage.bind( this ) );
		this.players = new Players();
		this.rooms = new Rooms( this.players );
		this.parser = new Parser( 'opcode:1' );
		this.socketID = 0;
		let map = new Map();
		map.loadMap( 'maps/1.map', map.parse );
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
			let rule = '';
			let callback = null;
			switch( opcode )
			{
				case 0:
					callback = socket.end;
					break;
				case 1:
					callback = this.generateAndSendID.bind( this );
					break;
				case 3:
					rule = 'id:4;nick:20';
					callback = this.assignNickname.bind( this );
					break;
				case 5:
					callback = this.listGames.bind( this );
					break;
				case 7:
					rule = 'id:4;roomName:20;passwordLength:1;password:passwordLength';
					callback = this.createRoom.bind( this );
					break;
				case 9:
					rule = 'playerID:4;mapID:4;maxPlayers:1';
					callback = this.configRoom.bind( this );
					break;
				case 0x10:
					rule = 'playerID:4;roomID:4;passwordLength:1;password:passwordLength';
					callback = this.loginToGame.bind( this );
					break;
				case 0x12:
					rule = 'id:4';
					callback = this.confirmGame.bind( this );
					break;
				case 0xfe:
					rule = 'id:4';
					callback = this.updateSocket.bind( this );
					break;
			}
			callback( socket, this.parser.decode( rule, data ) );

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

	displayWelcomeMessage()
	{
		console.log( this.server.address() );
	}

	send( socket, rule, object )
	{
		let buffer = this.parser.encode( rule, object );
		if( buffer !== false )
		{
			console.log( 'Sending data : ' + buffer.toString( 'hex' ) );
			socket.write( buffer );
		}
	}

	generateAndSendID( socket )
	{
		let id = this.players.addId( socket.id );
		if( id !== false )
		{
			this.send( socket, 'id:4', {
				opcode : Buffer.from( [ 0x2 ] ),
				id : id
			} );
		}
	}

	assignNickname( socket, data )
	{
		let object = {
			opcode : Buffer.from( [ 0x4 ] ),
			status : Buffer.from( [ 0 ] )
		};
		if( this.players.addNickname( data.id, data.nick ) )
		{
			object.status = Buffer.from( [ 1 ] );
		}
		this.send( socket, 'status:1', object );
	}

	createRoom( socket, data )
	{
		let object = {
			opcode : Buffer.from( [ 0x8 ] ),
			status : Buffer.from( [ 0 ] )
		};
		if( this.rooms.addRoom( data.roomName, data.password, data.id ) )
		{
			object.status = Buffer.from( [ 1 ] );
		}
		this.send( socket, 'status:1', object );
	}

	listGames( socket )
	{
		console.log( 'Listing games for ' + socket.id );
		let object = this.rooms.getRooms();
		object.opcode = Buffer.from( [ 0x6 ] );
		this.send( socket, 'count:4;games(id:4,name:20)*count', object );
	}

	configRoom( socket, data )
	{
		let object = {
			opcode : Buffer.from( [ 0xa ] ),
			status : Buffer.from( [ 0 ] )
		};
		if( this.rooms.configRoom( data.playerID, data.mapID, data.maxPlayers ) )
		{
			object.status = Buffer.from( [ 1 ] );
		}
		this.send( socket, 'status:1', object );
	}

	loginToGame( socket, data )
	{
		let object = {
			opcode : Buffer.from( [ 0x11 ] ),
			status : Buffer.from( [ 0 ] )
		};
		let map = this.rooms.loginToRoom( data.playerID, data.roomID, data.password );
		if( map !== false )
		{
			object.status = Buffer.from( [ 1 ] );
			object.mapID = map;
		}
		this.send( socket, 'status:1;mapID:4&status=1', object );
	}

	confirmGame( socket, data )
	{
		let object = {
			opcode : Buffer.from( [ 0x13 ] ),
			status : Buffer.from( [ 0 ] )
		};
		let players = false;
		if( this.players.confirmGame( data.id ) !== false )
		{
			players = this.rooms.confirmGame( data.id );
			object.status = Buffer.from( [ 1 ] );
		}
		this.send( socket, 'status:1', object );
		if( players !== false )
		{
			for( let i = 0 ; i < players.length ; i++ )
			{
				let socket = this.players.getSocket( players[ i ] );
				if( socket !== false )
				{
					this.send( socket, '', {
						opcode : Buffer.from( [ 0x14 ] )
					} );
				}
			}
		}
	}

	updateSocket( socket, data )
	{
		let object = {
			opcode : Buffer.from( [ 0xff ] ),
			status : Buffer.from( [ 0 ] )
		};
		if( this.players.updateSocket( data.id, socket ) !== false )
		{
			object.status = Buffer.from( [ 1 ] );
		}
		this.send( socket, 'status:1', object );
	}
}

module.exports = Server;