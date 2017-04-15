'use strict';
const Logger = require( './Logger' );
const GameServer = require( '../GameServer' );
const PlayersStorage = require( '../Players/PlayersStorage' );
const ResourcesDownloader = require( '../ResourcesDownloader' );
const MapInterface = require( '../MapInterface' );
const WeaponsInterface = require( '../WeaponsInterface' );
class App {
	constructor()
	{
		this.logger = new Logger();
		this.mapsList = [];
		this.playersStorage = new PlayersStorage();
		this.resourcesDownloader = new ResourcesDownloader();
		this.resourcesDownloader.download( this.startServer.bind( this ) );
		MapInterface.loadAndParseMapsList( this.loadMapsList.bind( this ) );
		this.weaponsInterface = new WeaponsInterface();
		this.weaponsInterface.loadWeaponsListFromFile( this.loadWeaponsList.bind( this ) );
	}

	startServer()
	{
		this.gameServer = GameServer( { maxClients : 4 } );
		this.gameServer.on( 'connection', this.playersStorage.addPlayer.bind( this.playersStorage ) );
	}

	loadMapsList( error, data )
	{
		if( error )
		{
			console.log( 'Maps list does not exist' );
			process.exit( 1 );
		}
		this.mapsList = data;
	}

	loadWeaponsList( error )
	{
		if( error )
		{
			console.log( 'Weapons list does not exist' );
			process.exit( 1 );
		}
	}
}
module.exports = App;

