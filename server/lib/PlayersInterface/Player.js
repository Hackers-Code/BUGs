'use strict';
const Sockets = require( '../GameServer/Protocol/Types' ).Sockets;
class Player {
	constructor( client, playersStorage )
	{
		this.playersStorage = playersStorage;
		this.uniqueNameStorage = playersStorage.getUniqueNameStorage();
		this.roomsStorage = playersStorage.getRoomsStorage();
		this.name = this.uniqueNameStorage.getDefault();
		this.client = client;
		this.hasCustomName = false;
		this.setDefaults();
		this.handleEvents();
	}

	setDefaults()
	{
		this.room = null;
		this.roomClientId = -1;
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

	getRoomClientId()
	{
		return this.roomClientId;
	}

	getPublicData()
	{
		return {
			playerID : this.roomClientId,
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
		//this.client.on( 'joinRoom', this.setPhysics.bind( this ) );
		//this.client.on( 'getRoomConfig', this.setPhysics.bind( this ) );
		//this.client.on( 'setPlayerProperties', this.setPhysics.bind( this ) );
		//this.client.on( 'switchReady', this.setPhysics.bind( this ) );
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
		respond( { games : this.roomsStorage.listAvailableGames() } );
	}

	createRoom( data, respond )
	{
		respond( { status : this.roomsStorage.addRoom( data, this ) } );
	}

	assignRoom( room, roomClientId, isAdmin = false )
	{
		this.room = room;
		this.roomClientId = roomClientId;
		this.isAdmin = isAdmin;
	}

	setPhysics( data, respond )
	{
		if( this.isAdmin && this.room !== null )
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
		if( this.isAdmin && this.room !== null )
		{
			respond( { status : this.room.setConfig( data ) } );
		}
		else
		{
			respond( { status : false } );
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
