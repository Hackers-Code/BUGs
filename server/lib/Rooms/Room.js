'use strict';

const Status = {
	uninitialized : 0,
	waitingForPlayers : 1,
	waitingForConfirming : 2,
	inGame : 3
};
const SearchEngine = require( '../Utils/SearchEngine' );
const Game = require( '../Game/Game' );
const Player = require( '../Game/Player' );
const MapInterface = require( '../MapInterface/MapInterface' );
class Room {
	constructor( settings, client, id, roomsStorage )
	{
		this.id = id;
		this.name = settings.name;
		this.password = settings.password;
		this.admin = client.id;
		this.roomsStorage = roomsStorage;
		this.logger = roomsStorage.getLogger();
		this.tasksStorage = roomsStorage.getTasksStorage();
		this.players = [];
		this.playersID = 0;
		this.players.push( new Player( client, this.playersID++ ) );
		this.status = Status.uninitialized;
		this.mapID = 1;
		this.maxPlayers = 2;
		this.roomConfigResponse = null;
		this.playersList = null;
		this.game = new Game( this.players );
		this.tasks = [];
		this.leaderboard = [];
		this.preparePlayersList();
		MapInterface.loadAndParseMapsList( process.cwd() + '/resources/maps/list.json', ( err, data ) =>
		{
			if( err )
			{
				this.logger.error( 'Maps list does not exist' );
				process.exit( 1 );
			}
			this.mapsList = data;
		} );
	}

	getGame()
	{
		return this.game;
	}

	getTasksStorage()
	{
		return this.tasksStorage;
	}

	getTasks()
	{
		return this.tasks;
	}

	leave( id )
	{
		if( this.status < Status.inGame )
		{
			if( this.admin.compare( id ) === 0 )
			{
				this.roomsStorage.removeRoom( this.id );
				let adminIndex = SearchEngine.findByUniqueID( id, this.players );
				if( adminIndex !== false && adminIndex !== -1 )
				{
					this.players.splice( adminIndex, 1 );
				}
				let reason = Buffer.from( 'Admin left lobby!' );
				this.players.forEach( ( element ) =>
				{
					element.send( {
						opcode : 0x04,
						length : Buffer.from( [ reason.length ] ),
						reason : reason
					} );
				} );
			}
			else
			{
				let index = SearchEngine.findByUniqueID( id, this.players );
				if( index !== false && index !== -1 )
				{
					this.players.splice( index, 1 );
					if( this.status === Status.waitingForConfirming )
					{
						this.status = Status.waitingForPlayers;
					}
				}
			}
		}
		else
		{
			let index = SearchEngine.findByUniqueID( id, this.players );
			if( index !== false && index !== -1 )
			{
				this.leaderboard.unshift( { id : Buffer.from( [ this.players[ index ].getPlayerID() ] ) } );
				this.players.splice( index, 1 );
				if( this.players.length === 1 )
				{
					this.leaderboard.unshift( { id : Buffer.from( [ this.players[ 0 ].getPlayerID() ] ) } );
					let count = Buffer.alloc( 4 );
					count.writeUInt32BE( this.leaderboard.length, 0 );
					this.players[ 0 ].send( {
						opcode : 0x3a,
						count,
						players : this.leaderboard
					} );
				}
				if( this.players.length === 0 )
				{
					this.roomsStorage.removeRoom( this.id );
				}
			}
		}

	}

	isAvailable()
	{
		if( this.status === Status.waitingForPlayers )
		{
			return {
				name : this.name,
				id : this.id
			};
		}
		else
		{
			return false;
		}
	}

	setConfig( id, config )
	{
		if( this.status === Status.uninitialized )
		{
			if( id.compare( this.admin ) === 0 )
			{
				this.maxPlayers = config.maxPlayers.readInt8( 0 );
				if( this.maxPlayers < 2 || this.maxPlayers > 4 )
				{
					return false;
				}
				this.mapID = config.mapID.readInt32BE( 0 );
				if( !MapInterface.mapExists( this.mapID, this.mapsList ) )
				{
					return false;
				}
				this.status = Status.waitingForPlayers;
				let map = Buffer.alloc( 4 );
				map.writeUInt32BE( this.mapID, 0 );
				let physics = this.game.getPhysics();
				let gravity = physics.gravity;
				let jumpHeight = physics.jumpHeight;
				let maxSpeedX = physics.maxSpeedX;
				let maxSpeedY = physics.maxSpeedY;
				let maxPlayers = Buffer.alloc( 1 );
				maxPlayers.writeUInt8( this.maxPlayers, 0 );
				this.roomConfigResponse = {
					map,
					gravity,
					jumpHeight,
					maxSpeedX,
					maxSpeedY,
					maxPlayers
				};
				this.checkIfAllConfirmed();
				return true;
			}
			return false;
		}
	}

	setPhysics( id, physics )
	{
		if( this.status === Status.uninitialized )
		{
			if( id.compare( this.admin ) === 0 )
			{
				this.game.setPhysics( physics );
				return true;
			}
		}
		return false;
	}

	joinRoom( password, client )
	{
		if( this.status === Status.waitingForPlayers )
		{
			if( password.compare( this.password ) === 0 )
			{
				this.players.push( new Player( client, this.playersID++ ) );
				if( this.players.length === this.maxPlayers )
				{
					this.status = Status.waitingForConfirming;
				}
				return true;
			}
			return false;
		}
		return false;
	}

	checkIfAllConfirmed()
	{
		if( this.getReadyPlayersAmount() !== this.maxPlayers )
		{
			setTimeout( this.checkIfAllConfirmed.bind( this ), 1000 );
			return;
		}
		this.status = Status.inGame;
		this.game.loadMap( this.mapID, this.mapsList );
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			this.players[ i ].send( { opcode : 0x30 } );
		}
		this.checkIfAllLoadedMap();
	}

	getReadyPlayersAmount()
	{
		let amount = 0;
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			if( this.players[ i ].confirmed === true )
			{
				amount++;
			}
		}
		return amount;
	}

	preparePlayersList()
	{
		let count = Buffer.alloc( 4 );
		count.writeInt32BE( this.players.length, 0 );
		let players = [];
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			players.push( {
				playerID : Buffer.from( [ this.players[ i ].playerID ] ),
				name : this.players[ i ].name,
				colourR : this.players[ i ].colour.R,
				colourG : this.players[ i ].colour.G,
				colourB : this.players[ i ].colour.B,
				mask : this.players[ i ].mask
			} );
		}
		let ready = Buffer.alloc( 1 );
		ready.writeUInt8( this.getReadyPlayersAmount(), 0 );
		this.playersList = {
			ready,
			count,
			players
		};

		setTimeout( this.preparePlayersList.bind( this ), 1000 );
	}

	getPlayers()
	{
		return this.playersList;
	}

	checkIfAllLoadedMap()
	{
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			if( this.players[ i ].mapLoaded === false )
			{
				setTimeout( this.checkIfAllLoadedMap.bind( this ), 100 );
				return;
			}
		}
		let wormsTaskId = this.tasksStorage.addTask( () =>
		{
			let data = this.game.getWorms();
			this.players.forEach( ( element ) =>
			{
				element.send( data, 'UDP' );
			} );
		} );
		this.tasks.push( wormsTaskId );
		this.tasksStorage.runTask( wormsTaskId );
		let timeTaskId = this.tasksStorage.addTask( () =>
		{
			let data = this.game.getTimeLeft();
			this.players.forEach( ( element ) =>
			{
				element.send( data, 'UDP' );
			} );
		} );
		this.tasks.push( timeTaskId );
		this.tasksStorage.runTask( timeTaskId );
		setTimeout( this.game.start.bind( this.game ), 3000 );
	}

	getRoomConfig()
	{
		return this.roomConfigResponse;
	}
}

module.exports = Room;
