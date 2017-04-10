'use strict';
const GameServer = require( '../GameServer' );
const ResourcesDownloader = require( '../ResourcesDownloader' );
class App {
	constructor()
	{
		this.resourcesDownloader = new ResourcesDownloader();
		this.resourcesDownloader.download( this.startServer );
	}

	startServer()
	{
	}
}
module.exports = App;

