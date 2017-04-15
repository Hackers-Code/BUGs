const http = require( 'http' );
const fs = require( 'fs' );
const mkdirp = require( 'mkdirp' );
const path = require( 'path' );
class ResourcesDownloader {
	constructor( downloadDirectory )
	{
		this._host = 'bugs.hackers-code.boakgp.hekko24.pl';
		this._downloadDirectory = downloadDirectory;
	}

	download( callback )
	{
		mkdirp( this._downloadDirectory, ( err ) =>
		{
			if( err )
			{
				throw err;
			}
			this.downloadResources( [ '/resources.json' ], callback );
		} );
	}

	downloadResources( uri, callback )
	{
		if( uri.length === 0 )
		{
			callback();
		}
		let uris = [];
		let toDownload = uri.length;
		uri.forEach( ( element ) =>
		{
			http.get( {
				host : this._host,
				path : element
			}, ( response ) =>
			{
				let body = Buffer.alloc( 0 );
				response.on( 'data', ( d ) =>
				{
					body = Buffer.concat( [
						body,
						d
					] );
				} );
				response.on( 'end', () =>
				{
					if( element === '/resources.json' )
					{
						uris = ResourcesDownloader.getUrisFromResourcesJson( body.toString() );
					}
					else if( element === '/maps/list.json' )
					{
						uris = ResourcesDownloader.getUrisFromMapsJson( body.toString() );
					}
					let filename = this._downloadDirectory + element;
					let dir = path.dirname( filename );
					mkdirp( dir, ( err ) =>
					{
						if( !fs.existsSync( dir ) )
						{
							throw err;
						}
						fs.writeFileSync( filename, body );
						if( --toDownload === 0 )
						{
							this.downloadResources( uris, callback );
						}
					} );
				} );
			} );
		} );
	}

	static getUrisFromResourcesJson( body )
	{
		let parsed = JSON.parse( body );
		if( typeof parsed.maps === 'undefined' || typeof parsed.weapons === 'undefined' )
		{
			throw new Error( 'Could not find resources' );
		}
		return [
			parsed.maps,
			parsed.weapons
		];
	}

	static getUrisFromMapsJson( body )
	{
		let parsed = JSON.parse( body );
		let uris = [];
		parsed.forEach( ( element ) =>
		{
			if( typeof element.map_file === 'string' )
			{
				uris.push( element.map_file );
			}
		} );
		return uris;
	}
}
module.exports = ResourcesDownloader;
