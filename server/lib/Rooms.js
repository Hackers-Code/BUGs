const Room = require( './Room.js' );
const UniqueID = require( './UniqueKeyGenerator.js' );
const UniqueName = require( './UniqueNameStorage.js' );

class Rooms {
	constructor( players )
	{
		this.rooms = [];
		this.keyGenerator = new UniqueID( 4 );
		this.nameStorage = new UniqueName( 20 );
		this.players = players;
	}

	addRoom( name, password, ownerID )
	{
		if( this.players.isFree( ownerID ) )
		{
			if( this.nameStorage.checkName( name ) )
			{
				let gameID = this.keyGenerator.generateKey();
				let room = new Room( gameID, name, password, ownerID );
				this.players.addGameToPlayer( ownerID, gameID );
				this.rooms.push( room );
				return true;
			}
			console.log( 'Room name is not unique' );
			return false;
		}
		else
		{
			console.log( 'Player is not free' );
			return false;
		}
	}

	getPlayers( playerID )
	{
		let index = this.findRoomByID( this.players.getPlayerGame( playerID ) );
		if( index !== -1 )
		{
			let players = this.rooms[ index ].getPlayers();
			let playersList = [];
			let playersCount = Buffer.alloc( 4 );
			playersCount.writeInt32BE( players.length, 0 );
			for( let i = 0 ; i < players.length ; i++ )
			{
				playersList.push( {
					id : Buffer.from( [ i ] ),
					name : this.players.getName( players[ i ] )
				} );
			}
			return {
				playersCount : playersCount,
				players : playersList
			};
		}
		else
		{
			console.log( 'Not found room' );
			return false;
		}
	}

	confirmGame( playerID )
	{
		let index = this.findRoomByID( this.players.getPlayerGame( playerID ) );
		if( index !== -1 )
		{
			return this.rooms[ index ].confirmGame();
		}
		else
		{
			console.log( 'Not found room' );
			return false;
		}
	}

	loginToRoom( playerID, roomID, password )
	{
		console.log( 'PlayerID: ' + playerID.toString( 'hex' ) );
		console.log( 'RoomID: ' + roomID.toString( 'hex' ) );
		console.log( 'Password: ' + password.toString( 'hex' ) );
		if( this.players.isFree( playerID ) )
		{
			let index = this.findRoomByID( roomID );
			if( index !== -1 )
			{
				if( this.rooms[ index ].loginToRoom( playerID, password ) )
				{
					if( this.players.addGameToPlayer( playerID, roomID ) )
					{
						return this.rooms[ index ].getCurrentMap();
					}
					else
					{
						console.log( 'Add game to player failed' );
						return false;
					}
				}
				else
				{
					console.log( 'Login failed' );
					return false;
				}
			}
			else
			{
				console.log( 'Room: ' + roomID + ' not found' );
				return false;
			}
		}
		else
		{
			console.log( 'Player is not free' );
			return false;
		}
	}

	configRoom( playerID, mapID, maxPlayers )
	{
		let index = this.findRoomByID( this.players.getPlayerGame( playerID ) );
		if( index !== -1 )
		{
			return this.rooms[ index ].setConfig( playerID, mapID, maxPlayers );
		}
		else
		{
			console.log( 'Not found room' );
			return false;
		}
	}

	getRooms()
	{
		let gamesCount = 0;
		let games = [];
		for( let i = 0 ; i < this.rooms.length ; i++ )
		{
			let game = this.rooms[ i ].isWaitingForPlayers();
			if( game !== false )
			{
				gamesCount++;
				console.log( 'Game number ' + gamesCount + ' with name ' + game.name.toString(
						'ascii' ) + ' has id ' + game.id.toString( 'hex' ) );
				games.push( {
					id : game.id,
					name : game.name
				} );
			}
		}
		let count = Buffer.alloc( 4 );
		count.writeInt32BE( gamesCount, 0 );
		return {
			count : count,
			games : games
		};
	}

	getWorms( playerID )
	{
		let index = this.findRoomByID( this.players.getPlayerGame( playerID ) );
		if( index !== -1 )
		{
			let worms = this.rooms[ index ].getWorms();
			let wormsList = [];
			let wormsCount = Buffer.alloc( 4 );
			wormsCount.writeInt32BE( worms.length, 0 );
			for( let i = 0 ; i < worms.length ; i++ )
			{
				wormsList.push( {
					owner_id : worms[ i ].ownerID,
					worm_id : worms[ i ].id,
					hp : worms[ i ].hp,
					x : worms[ i ].x,
					y : worms[ i ].y
				} );
			}
			return {
				wormsCount : wormsCount,
				worms : wormsList
			};
		}
		else
		{
			console.log( 'Not found room' );
			return false;
		}
	}

	findRoomByID( id )
	{
		console.log( 'Looking for player with id ' + id.toString( 'hex' ) );
		for( let i = 0 ; i < this.rooms.length ; i++ )
		{
			if( id.compare( this.rooms[ i ].id ) === 0 )
			{
				return i;
			}
		}
		return -1;
	}
}

module.exports = Rooms;