'use strict';
const GameServer = require( '../GameServer' );
const PlayersStorage = require( '../Players/PlayersStorage' );
const ResourcesDownloader = require( '../ResourcesDownloader' );
class App {
	constructor()
	{
		this.playersStorage = new PlayersStorage();
		this.resourcesDownloader = new ResourcesDownloader();
		this.resourcesDownloader.download( this.startServer.bind( this ) );
	}

	startServer()
	{
		this.gameServer = GameServer( { maxClients : 4 } );
		this.gameServer.on( 'connection', this.playersStorage.addPlayer.bind( this.playersStorage ) );
	}
}
module.exports = App;

