'use strict';
const fs = require( 'fs' );
const ResourcesDownloader = require( './ResourcesDownloader' );
const Weapons = require( './Weapons' );
const MapsAPI = require( './MapsAPI' );
class ResourcesInterface {
	constructor( projectPath )
	{
		this.resourcesPath = projectPath + '/resources';
		this.resourcesDownloader = new ResourcesDownloader( this.resourcesPath );
	}

	download( callback )
	{
		this.resourcesDownloader.download( callback );
	}

	loadWeapons( callback )
	{
		this.loadResourcesListJSON( this.resourcesPath + '/weapons', ( error, array ) =>
		{
			if( error )
			{
				callback( error );
			}
			else
			{
				callback( void 0, new Weapons( array ) )
			}
		} );
	}

	loadMapsAPI( callback )
	{
		this.loadResourcesListJSON( this.resourcesPath + '/maps', ( error, array ) =>
		{
			if( error )
			{
				callback( error );
			}
			else
			{
				callback( void 0, new MapsAPI( array, this.resourcesPath ) )
			}
		} );
	}

	loadResourcesListJSON( resourcePath, callback )
	{
		fs.readFile( resourcePath + '/list.json', ( readFileError, data ) =>
		{
			if( readFileError )
			{
				callback( readFileError );
			}
			else
			{
				let array = [];
				try
				{
					array = JSON.parse( data );
				}
				catch( jsonParseError )
				{
					callback( jsonParseError );
					return;
				}
				if( array instanceof Array === false )
				{
					callback( new TypeError( 'Items list must be an array' ) );
				}
				else
				{
					callback( void 0, array );
				}
			}
		} );
	}
}

module.exports = ResourcesInterface;
