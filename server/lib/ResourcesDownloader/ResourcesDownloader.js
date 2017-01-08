const http = require( 'http' );
class ResourcesDownloader {
	constructor()
	{
		this.server = 'http://hackers-code.boakgp.hekko24.pl';
		this.projectPath = '/creepy-crawlies';
		this.mapsPath = '/maps';
	}

	getMapList( callback )
	{
		http.get( this.server + this.projectPath + this.mapsPath + '/list.json', ( res ) =>
		{
			let rawData = '';
			res.on( 'data', ( chunk ) => rawData += chunk );
			res.on( 'end', () =>
			{
				try
				{
					let parsedData = JSON.parse( rawData );
					console.log( parsedData );
				}
				catch( e )
				{
					console.log( e.message );
				}
			} );
			callback( void 0, {} );
		} );
	}
}
module.exports = ResourcesDownloader;
