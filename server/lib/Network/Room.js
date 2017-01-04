'use strict';

const Status = {
	uninitialized : 0,
	waitingForPlayers : 1,
	waitingForConfirming : 2,
	inGame : 3
};
const SearchEngine = require( './../Utils/SearchEngine' );
const Game = require( './../Game/Game' );
const Player = require( './../Game/Player' );
const MapInterface = require( './../MapInterface/MapInterface' );
class Room {
	constructor( settings, client, id, roomsStorage )
	{
		this.id = id;
		this.name = settings.name;
		this.password = settings.password;
		this.admin = client.id;
		this.roomsStorage = roomsStorage;
		this.players = [];
		this.players.push( new Player( client ) );
		this.status = Status.uninitialized;
		this.mapID = 1;
		this.maxPlayers = 2;
		this.roomConfigResponse = null;
		this.playersList = null;
		this.game = new Game( this.players );
	}

	leave( id )
	{
		if( this.status < Status.inGame )
		{
			if( id === this.admin )
			{
				this.roomsStorage.removeRoom( this.id );
				let adminIndex = SearchEngine.findByUniqueID( this.players, id );
				if( adminIndex !== false && adminIndex !== -1 )
				{
					this.players.splice( adminIndex, 1 );
				}
				let reason = Buffer.alloc( 30 );
				reason.write( 'Admin left lobby!' );
				this.players.forEach( ( element ) =>
				{
					element.response.send( {
						opcode : 0x04,
						reason : reason
					} );
				} );
			}
			else
			{
				let index = SearchEngine.findByUniqueID( this.players, id );
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
			let index = SearchEngine.findByUniqueID( this.players, id );
			if( index !== false && index !== -1 )
			{
				this.players.splice( index, 1 );
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
				this.mapID = config.mapID.readInt32BE( 0 );
				if( !MapInterface.mapExists( this.mapID ) )
				{
					return false;
				}
				this.status = Status.waitingForPlayers;
				let map = Buffer.alloc( 4 );
				map.writeUInt32BE( this.mapID, 0 );
				let physics = this.game.getPhysics();
				let gravity = Buffer.alloc( 2 );
				gravity.writeUInt16BE( physics.gravity, 0 );
				let jumpHeight = Buffer.alloc( 2 );
				jumpHeight.writeInt16BE( physics.jumpHeight, 0 );
				let maxSpeedX = Buffer.alloc( 2 );
				maxSpeedX.writeUInt16BE( physics.maxSpeedX, 0 );
				let maxSpeedY = Buffer.alloc( 2 );
				maxSpeedY.writeUInt16BE( physics.maxSpeedY, 0 );
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
				this.preparePlayersList();
				this.checkIfAllConfirmed();
				return true;
			}
		}
		return false;
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
				this.players.push( new Player( client ) );
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
		this.game.loadMap( this.mapID );
		for( let i = 0 ; i < this.players.length ; i++ )
		{
			this.players[ i ].response.send( { opcode : 0x30 } );
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
			let id = Buffer.alloc( 1 );
			id.writeInt8( i, 0 );
			players.push( {
				id : id,
				name : this.players[ i ].name
			} );
		}
		let ready = Buffer.alloc( 1 );
		ready.writeUInt8( this.getReadyPlayersAmount, 0 );
		this.playersList = {
			ready,
			count,
			players
		};
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
		setTimeout( this.game.start.bind( this.game ), 3000 );
	}

	getRoomConfig()
	{
		return this.roomConfigResponse;
	}
}
module.exports = Room;
