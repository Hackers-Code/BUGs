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

	getMapsList()
	{
		let req = http.request( this.options, ( res ) =>
		{
			console.log( `STATUS: ${res.statusCode}` );
			console.log( `HEADERS: ${JSON.stringify( res.headers )}` );
			res.setEncoding( 'utf8' );
			res.on( 'data', ( chunk ) =>
			{
				console.log( `BODY: ${chunk}` );
			} );
			res.on( 'end', () =>
			{
				console.log( 'No more data in response.' );
			} );
		} );
		req.on( 'error', ( e ) =>
		{
			console.log( `problem with request: ${e.message}` );
		} );
		req.write();
		req.end();
	}
}
module.exports = MapDownloader;
