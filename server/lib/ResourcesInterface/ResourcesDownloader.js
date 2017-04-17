'use strict';
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
		mkdirp( this._downloadDirectory, ( mkdirpError ) =>
		{
			if( mkdirpError )
			{
				callback( mkdirpError );
			}
			this.downloadResources( [ '/resources.json' ], callback );
		} );
	}

	downloadResources( resourcesToDownload, callback )
	{
		if( resourcesToDownload.length === 0 )
		{
			callback( void 0 );
		}
		let collectedURIs = [];
		let downloadedItems = 0;
		for( let i = 0 ; i <= resourcesToDownload.length ; i++ )
		{
			let uri = resourcesToDownload[ i ];
			let downloadPath = this._downloadDirectory + uri;
			let dir = path.dirname( downloadPath );
			mkdirp( dir, ( mkdirpError ) =>
			{
				if( !fs.existsSync( dir ) )
				{
					callback( mkdirpError );
				}
				else
				{
					http.get( {
						host : this._host,
						path : uri
					}, ( response ) =>
					{
						let body = Buffer.alloc( 0 );
						response.on( 'data', ( data ) =>
						{
							body = Buffer.concat( [
								body,
								data
							] );
						} );
						response.on( 'end', () =>
						{
							if( uri === '/resources.json' )
							{
								try
								{
									collectedURIs = ResourcesDownloader.getUrisFromResourcesJson( body.toString() );
								}
								catch( error )
								{
									callback( error );
									return;
								}
							}
							else if( uri === '/maps/list.json' )
							{
								collectedURIs = ResourcesDownloader.getUrisFromMapsJson( body.toString() );
							}
							fs.writeFileSync( downloadPath, body );
							if( ++downloadedItems === resourcesToDownload.length )
							{
								this.downloadResources( collectedURIs, callback );
							}
						} );
					} );
				}
			} );
		}
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
			if( typeof element[ "map_file" ] === 'string' )
			{
				uris.push( element[ "map_file" ] );
			}
		} );
		return uris;
	}
}
module.exports = ResourcesDownloader;
