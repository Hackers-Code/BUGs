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
		this.room = null;
		this.lobbyID = -1;
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
		this.world = null;
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
			colourR : this.color.R,
			colourG : this.color.G,
			colourB : this.color.B,
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
		//this.client.on( 'getRoomConfig', this.setPhysics.bind( this ) );
		//this.client.on( 'setPlayerProperties', this.setPhysics.bind( this ) );
		this.client.on( 'switchReady', this.setReady.bind( this ) );
		this.client.on( 'listPlayers', this.listPlayers.bind( this ) );
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
		if( this.room !== null )
		{
			this.room.leave();
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
				status : this.roomsCollection.joinRoom( data, this )
			} );
		}
	}

	listPlayers( data, respond )
	{
		if( this.room !== null )
		{
			respond( {
				readyPlayers : this.room.getReadyPlayersCount(),
				players : this.room.getPlayersList()
			} );
		}
	}
}
module.exports = Player;
