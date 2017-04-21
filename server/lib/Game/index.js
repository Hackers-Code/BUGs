'use strict';
const World = require( './World' );
const Bug = require( './World/Objects/Bug' );
const MAX_TICKS = 16;
const WORMS_PER_PLAYER = 5;
class Game {
	constructor( mapAPI )
	{
		this.mapAPI = mapAPI;
		this.mapID = 0;
		this.playersCount = 0;
		this.physics = {
			gravity : 475,
			jumpHeight : -300,
			maxSpeedY : 1024,
			maxSpeedX : 160
		};
		this.world = null;
		this.players = [];
		this.bugs = [];
		this.tick = 0;
	}

	setMapID( mapID )
	{
		this.mapID = mapID;
		this.mapAPI.loadMap( this.mapID, ( error, map ) =>
		{
			if( error )
			{
				this.map = false;
			}
			else
			{
				this.map = map;
			}
		} );
	}

	getMapID()
	{
		return this.mapID;
	}

	setPhysics( data )
	{
		this.physics = {
			gravity : data.gravity,
			jumpHeight : data.jumpHeight,
			maxSpeedY : data.maxSpeedY,
			maxSpeedX : data.maxSpeedX
		};
	}

	getPhysics()
	{
		return this.physics;
	}

	setPlayersCount( count )
	{
		this.playersCount = count;
	}

	canStart()
	{
		return this.map !== false;
	}

	init( players )
	{
		this.spawnWorms();
		this.players = players;
		for( let i = 0 ; i < this.bugs.length ; i++ )
		{
			let playerIndex = i % this.players.length;
			let playerLobbyID = this.players[ playerIndex ].lobbyID;
			this.players[ playerIndex ].addWorm( this.bugs[ i ] );
			this.bugs[ i ].assignOwnerId( playerLobbyID );
		}
		this.sendGameStateToPlayers();
	}

	serializeBugs()
	{
		let retval = [];
		this.bugs.forEach( ( element ) =>
		{
			retval.push( element.getData() );
		} );
		return retval;
	}

	getState()
	{
		return {
			tick : this.tick,
			bugs : this.serializeBugs()
		};
	}

	sendGameStateToPlayers()
	{
		let state = this.getState();
		this.players.forEach( ( element ) =>
		{
			element.sendGameState( state );
		} );
		setTimeout( this.sendGameStateToPlayers.bind( this ), 1000 / MAX_TICKS );
	}

	spawnWorms()
	{
		for( let i = 0 ; i < WORMS_PER_PLAYER * this.playersCount ; i++ )
		{
			this.bugs.push( new Bug( this.world.popRandomSpawn(), i ) );
		}
	}

	delayedStart( players, seconds )
	{
		this.world = new World( this.map );
		this.init( players );
		setTimeout( this.start.bind( this ), seconds * 1000 );
	}

	start()
	{

	}
}

module.exports = Game;
