'use strict';
const World = require( './World' );
const Bug = require( './World/Objects/Bug' );
const MAX_TICKS = 16;
const BUGS_PER_PLAYER = 5;
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
		this.currentPlayer = 0;
		this.bugs = [];
		this.tick = 0;
		this.roundTimeLeft = 60;
		this.lastTickTime = 0;
		this.isRunning = false;
	}

	getBugs()
	{
		return this.bugs;
	}

	getMap()
	{
		return this.map;
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
		this.spawnBugs();
		this.players = players;
		for( let i = 0 ; i < this.bugs.length ; i++ )
		{
			let playerIndex = i % this.players.length;
			let playerLobbyID = this.players[ playerIndex ].lobbyID;
			this.players[ playerIndex ].addWorm( this.bugs[ i ] );
			this.bugs[ i ].assignOwnerId( playerLobbyID );
		}
		this.sendGameStateToPlayers();
		this.sendTimeLeftToPlayers();
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

	sendGameStateToPlayers()
	{
		let state = {
			tick : this.tick,
			bugs : this.serializeBugs()
		};
		this.players.forEach( ( element ) =>
		{
			element.sendGameState( state );
		} );
	}

	sendTimeLeftToPlayers()
	{
		let time = {
			tick : this.tick,
			seconds : this.roundTimeLeft
		};
		this.players.forEach( ( element ) =>
		{
			element.sendTimeLeft( time );
		} );
	}

	spawnBugs()
	{
		for( let i = 0 ; i < BUGS_PER_PLAYER * this.playersCount ; i++ )
		{
			this.bugs.push( new Bug( this.world, this.world.popRandomSpawn(), i ) );
		}
	}

	delayedStart( players, seconds )
	{
		this.world = new World( this );
		this.init( players );
		setTimeout( this.start.bind( this ), seconds * 1000 );
	}

	start()
	{
		this.startRound();
		this.lastTickTime = new Date().getTime();
		this.isRunning = true;
		this.gameLoop();
	}

	gameLoop()
	{
		let now = new Date().getTime();
		let diff = (now - this.lastTickTime) / 1000;
		if( diff >= 1 / MAX_TICKS )
		{
			if( this.roundTimeLeft - diff < 0 )
			{
				this.endRound();
			}
			else
			{
				this.roundTimeLeft -= diff;
			}
			this.world.simulate( diff );
			this.sendTimeLeftToPlayers();
			this.sendGameStateToPlayers();
			this.lastTickTime = now;
			this.tick++;
		}
		if( this.isRunning )
		{
			setImmediate( this.gameLoop.bind( this ) );
		}
	}

	startRound()
	{
		if( this.players.length > 0 )
		{
			this.roundTimeLeft = 60;
			this.currentPlayer = (this.currentPlayer + 1 ) % this.players.length;
			let bug_id = this.players[ this.currentPlayer ].chooseBug();
			let turn = {
				player_id : this.players[ this.currentPlayer ].lobbyID,
				bug_id
			};
			this.players.forEach( ( element ) =>
			{
				element.notifyRoundStart( turn );
			} );
		}
	}

	endTurn()
	{
		if( this.roundTimeLeft > 5 )
		{
			this.roundTimeLeft = 5;
		}
	}

	endRound()
	{
		this.players[ this.currentPlayer ].notifyRoundEnd();
		this.startRound();
	}

	notifyRemovePlayer( index )
	{
		if( index < this.currentPlayer )
		{
			this.currentPlayer--;
		}
		if( index === this.currentPlayer )
		{
			this.currentPlayer--;
			this.startRound();
		}
	}

	removeBug( id )
	{
		for( let i = 0 ; i < this.bugs.length ; i++ )
		{
			if( this.bugs[ i ].id === id )
			{
				this.bugs.splice( i, 1 );
				break;
			}
		}
	}

	sendSelectWeaponToAll( data )
	{
		this.players.forEach( ( element ) =>
		{
			element.sendSelectWeapon( data );
		} );
	}

	sendUseWeaponToAll( data )
	{
		this.players.forEach( ( element ) =>
		{
			element.sendUseWeapon( data );
		} );
	}
}

module.exports = Game;
