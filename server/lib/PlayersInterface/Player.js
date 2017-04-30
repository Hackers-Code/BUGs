'use strict';
const Sockets = require( '../GameServer/Protocol/Types' ).Sockets;
class Player {
	constructor( client, playersInterface )
	{
		this.players = playersInterface;
		this.uniqueNameStorage = this.players.getUniqueNameStorage();
		this.roomsCollection = this.players.getRoomsCollection();
		this.name = this.uniqueNameStorage.getDefault();
		this.client = client;
		this.hasCustomName = false;
		this.setDefaults();
		this.handleEvents();
	}

	setDefaults()
	{
		this.weaponsList = this.players.getWeaponsList();
		this.room = null;
		this.lobbyID = 0;
		this.isAdmin = false;
		this.isInLobby = false;
		this.isInGame = false;
		this.color = {
			R : 0,
			G : 0,
			B : 0
		};
		this.mask = 0;
		this.isYourTurn = false;
		this.canAttack = false;
		this.game = null;
		this.currentWeapon = null;
		this.readyStatus = false;
		this.mapLoaded = false;
		this.bugs = [];
		this.currentBug = 0;
	}

	getPublicData()
	{
		return {
			lobbyID : this.lobbyID,
			name : this.name,
			colorR : this.color.R,
			colorG : this.color.G,
			colorB : this.color.B,
			mask : this.mask
		};
	}

	isReady()
	{
		return this.readyStatus;
	}

	handleEvents()
	{
		this.client.on( 'disconnect', () =>
		{
			if( this.hasCustomName )
			{
				this.uniqueNameStorage.removeName( this.name );
			}
			this.leaveRoom();
		} );
		this.client.on( 'error', ( error ) =>
		{
			throw error.message;
		} );
		this.client.on( 'changeName', this.setName.bind( this ) );
		this.client.on( 'leaveRoom', this.leaveRoom.bind( this ) );
		this.client.on( 'listGames', this.listGames.bind( this ) );
		this.client.on( 'createRoom', this.createRoom.bind( this ) );
		this.client.on( 'setGamePhysics', this.setPhysics.bind( this ) );
		this.client.on( 'setRoomConfig', this.setRoomConfig.bind( this ) );
		this.client.on( 'joinRoom', this.joinRoom.bind( this ) );
		this.client.on( 'getRoomConfig', this.getRoomConfig.bind( this ) );
		this.client.on( 'setPlayerProperties', this.setPlayerProperties.bind( this ) );
		this.client.on( 'switchReady', this.setReady.bind( this ) );
		this.client.on( 'listPlayers', this.listPlayers.bind( this ) );
		this.client.on( 'mapLoaded', this.setMapLoaded.bind( this ) );
		this.client.on( 'getWeaponsList', this.getWeaponsList.bind( this ) );
	}

	setName( data, respond )
	{
		if( this.uniqueNameStorage.addName( data.name ) )
		{
			if( this.hasCustomName === true && !this.uniqueNameStorage.removeName( this.name ) )
			{
				respond( { status : false } );
			}
			else
			{
				this.name = data.name;
				this.hasCustomName = true;
				respond( { status : true } );
			}
		}
		else
		{
			respond( { status : false } );
		}
	}

	leaveRoom()
	{
		if( this.isInLobby || this.isInGame )
		{
			this.room.leave( this.lobbyID );
			this.setDefaults();
		}
	}

	kickFromLobby( reason )
	{
		this.client.send( {
			opcode : 0x04,
			reason
		}, Sockets.tcp );
		this.leaveRoom();
	}

	listGames( data, respond )
	{
		respond( { games : this.roomsCollection.listAvailableGames() } );
	}

	createRoom( data, respond )
	{
		respond( { status : this.roomsCollection.addRoom( data, this ) } );
	}

	assignRoom( room, id, isAdmin = false )
	{
		this.isInLobby = true;
		this.room = room;
		this.lobbyID = id;
		this.isAdmin = isAdmin;
	}

	setPhysics( data, respond )
	{
		if( this.isAdmin && this.isInLobby )
		{
			respond( { status : this.room.setPhysics( data ) } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	setRoomConfig( data, respond )
	{
		if( this.isAdmin && this.isInLobby )
		{
			respond( { status : this.room.setConfig( data ) } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	setReady( data, respond )
	{
		if( this.isInLobby )
		{
			this.readyStatus = !this.readyStatus;
			this.room.notifyReadyStatusChange();
			respond( { status : true } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	joinRoom( data, respond )
	{
		if( this.isInLobby )
		{
			respond( { status : false } );
		}
		else
		{
			respond( {
				status : this.roomsCollection.joinRoom( data, this ),
				player_id : this.lobbyID
			} );
		}
	}

	setPlayerProperties( data, respond )
	{
		if( this.readyStatus === false )
		{
			[
				this.color.R,
				this.color.G,
				this.color.B
			] = [
				data.colorR,
				data.colorG,
				data.colorB
			];
			this.mask = data.mask;
			respond( { status : true } );
		}
		else
		{
			respond( { status : false } );
		}
	}

	getRoomConfig( data, respond )
	{
		if( this.isInLobby )
		{
			let config = this.room.getConfig();
			if( config !== false )
			{
				respond( config );
			}
		}
	}

	listPlayers( data, respond )
	{
		if( this.isInLobby )
		{
			respond( {
				readyPlayers : this.room.getReadyPlayersCount(),
				players : this.room.getPlayersList()
			} );
		}
	}

	startGame( game )
	{
		this.isInLobby = false;
		this.isInGame = true;
		this.game = game;
		this.client.send( {
			opcode : 0x30
		}, Sockets.tcp );
	}

	finishGame( leaderboard )
	{
		this.client.send( {
			opcode : 0x3a,
			players : leaderboard
		}, Sockets.tcp );
	}

	isMapLoaded()
	{
		return this.mapLoaded;
	}

	addWorm( bug )
	{
		this.bugs.push( bug );
	}

	sendGameState( state )
	{
		state.opcode = 0x32;
		this.client.send( state, Sockets.udp );
	}

	sendTimeLeft( time )
	{
		time.opcode = 0x35;
		this.client.send( time, Sockets.udp );
	}

	setMapLoaded()
	{
		if( this.isInGame )
		{
			this.mapLoaded = true;
			this.room.notifyMapLoaded();
		}
	}

	notifyRoundStart( turn )
	{
		if( turn.player_id === this.lobbyID )
		{
			this.isYourTurn = true;
			this.canAttack = true;
		}
		turn.opcode = 0x33;
		this.client.send( turn, Sockets.tcp );
	}

	getWeaponsList( data, respond )
	{
		let response = [];
		this.weaponsList.forEach( ( element ) =>
		{
			response.push( {
				id : element.id,
				usages : element.usages
			} );
		} );
		respond( response, Sockets.udp );
	}
}
module.exports = Player;
