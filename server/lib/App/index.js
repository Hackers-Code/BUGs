'use strict';
const Logger = require( './Logger' );
const ResourcesInterface = require( '../ResourcesInterface' );
const GameServer = require( '../GameServer' );
const PlayersInterface = require( '../PlayersInterface' );
class App {
	constructor()
	{
		this.maps = null;
		this.weapons = null;
		this.logger = new Logger();
		this.players = new PlayersInterface();
		this.resources = new ResourcesInterface( process.cwd() );
		this.resources.download( this.loadResources.bind( this ) );
	}

	loadResources()
	{
		this.resources.loadMapsAPI( this.loadMapsList.bind( this ) );
	}

	startServer()
	{
		this.logger.log( 'Creating GameServer socket' );
		this.gameServer = new GameServer( this.logger, { maxClients : 4 } );
		this.gameServer.on( 'connection', this.players.addPlayer.bind( this.players ) );
	}

	loadMapsList( error, data )
	{
		if( error )
		{
			this.logger.error( 'Loading maps failed with message: %s', error.message );
			process.exit( 1 );
		}
		this.logger.log( 'Maps list successfully loaded' );
		this.maps = data;
		this.resources.loadWeapons( this.loadWeaponsList.bind( this ) );
	}

	loadWeaponsList( error, data )
	{
		if( error )
		{
			this.logger.error( 'Loading weapons failed with message: %s', error.message );
			process.exit( 1 );
		}
		this.logger.log( 'Weapons list successfully loaded' );
		this.weapons = data;
		this.startServer();
	}
}
module.exports = App;

