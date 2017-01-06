const http = require( 'http' );
class MapDownloader {
	constructor( config )
	{
		this.options = {
			hostname : config.resources.localization.host,
			port : config.resources.localization.port,
			path : config.resources.maps.path,
			method : 'GET'
		};
	}
}
module.exports = MapDownloader;
