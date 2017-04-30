'use strict';
const Collection = require( '../../Collections' ).NumericIdCollection;
const Game = require( '../../Game' );
const EventEmitter = require( 'events' );
class Room extends Collection {
	constructor( settings, admin, id, roomsCollection )
	{
		super( 'players', 'lobbyID' );
		this.nextClientId = 0;
		this.name = settings.name;
		this.password = settings.password;
		this.admin = admin;
		this.admin.assignRoom( this, this.nextClientId++, true );
		this.players = [];
		this.players.push( admin );
		this.id = id;
		this.roomsCollection = roomsCollection;
		this.mapAPI = roomsCollection.getMapAPI();
		this.maxPlayers = 0;
		this.isConfigured = false;
		this.isWaitingForPlayers = false;
		this.isWaitingForConfirming = false;
		this.isInGame = false;
		this.leaderboard = [];
		this.game = new Game( this.mapAPI );
	}

	isAvailable()
	{
		return this.isWaitingForPlayers;
	}

	getPlayersList()
	{
		let retval = [];
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			retval.push( this.players[ i ].getPublicData() );
		}
		return retval;
	}

	getReadyPlayersCount()
	{
		let retval = 0;
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			retval += this.players[ i ].isReady();
		}
		return retval;
	}

	getMapLoadedPlayersCount()
	{
		let retval = 0;
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			retval += this.players[ i ].isMapLoaded();
		}
		return retval;
	}

	setPhysics( data )
	{
		if( this.isConfigured === false )
		{
			this.game.setPhysics( data );
			return true;
		}
		return false;
	}

	setConfig( data )
	{
		if( this.isConfigured === false )
		{
			if( data.players < 2 || data.players > 4 )
			{
				return false;
			}
			if( !this.mapAPI.mapExists( data.map ) )
			{
				return false;
			}
			this.game.setMapID( data.map );
			this.game.setPlayersCount( data.players );
			this.maxPlayers = data.players;
			this.isConfigured = true;
			this.isWaitingForPlayers = true;
			return true;
		}
		return false;
	}

	getConfig()
	{
		if( this.isConfigured )
		{
			let map = this.game.getMapID();
			let physics = this.game.getPhysics();
			return {
				map,
				gravity : physics.gravity,
				jumpHeight : physics.jumpHeight,
				maxSpeedY : physics.maxSpeedY,
				maxSpeedX : physics.maxSpeedX,
				maxPlayers : this.maxPlayers
			};
		}
		return false;
	}

	joinRoom( password, client )
	{
		if( this.isWaitingForPlayers && password === this.password )
		{
			if( this.nextClientId + 1 > 255 )
			{
				this.roomsCollection.removeRoom( this.id );
				this.players.forEach( ( element ) =>
				{
					element.kickFromLobby( 'Too many disconnections!' );
				} );
			}
			client.assignRoom( this, this.nextClientId++ );
			this.players.push( client );
			if( this.maxPlayers === this.players.length )
			{
				this.isWaitingForPlayers = false;
				this.isWaitingForConfirming = true;
			}
			return true;
		}
		return false;
	}

	leave( id )
	{
		if( !this.isInGame )
		{
			if( this.admin.lobbyID === id )
			{
				this.roomsCollection.removeRoom( this.id );
				this.players.splice( 0, 1 );
				this.players.forEach( ( element ) =>
				{
					element.kickFromLobby( 'Admin left lobby!' );
				} );
			}
			else
			{
				let index = this.find( id );
				if( index !== -1 )
				{
					this.players.splice( index, 1 );
					if( this.isWaitingForConfirming )
					{
						this.isWaitingForPlayers = true;
						this.isWaitingForConfirming = false;
					}
				}
			}
		}
		else
		{
			let index = this.find( id );
			if( index !== -1 )
			{
				this.leaderboard.unshift( { id : this.players[ index ].lobbyID } );
				this.game.notifyRemovePlayer( index );
				this.players.splice( index, 1 );
				if( this.players.length === 1 )
				{
					this.game.isRunning = false;
					this.leaderboard.unshift( { id : this.players[ 0 ].lobbyID } );
					this.players[ 0 ].finishGame( this.leaderboard );
				}
				if( this.players.length === 0 )
				{
					this.game.isRunning = false;
					this.roomsCollection.removeRoom( this.id );
				}
			}
		}
	}

	notifyReadyStatusChange()
	{
		if( this.isConfigured )
		{
			let readyPlayers = this.getReadyPlayersCount();
			if( readyPlayers === this.maxPlayers )
			{
				this.startGame();
			}
		}
	}

	notifyMapLoaded()
	{
		let mapLoadedPlayers = this.getMapLoadedPlayersCount();
		if( mapLoadedPlayers === this.maxPlayers )
		{
			this.runGame();
		}
	}

	startGame()
	{
		if( this.game.canStart() === false )
		{
			this.players.forEach( ( element ) =>
			{
				element.kickFromLobby( 'Server could not read this map. Try another one or contact developer' );
			} );
		}
		else
		{
			this.isInGame = true;
			this.players.forEach( ( element ) =>
			{
				element.startGame( this.game );
			} );
		}
	}

	runGame()
	{
		this.game.delayedStart( this.players, 3 );
	}
}

module.exports = Room;
