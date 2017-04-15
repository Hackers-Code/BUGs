'use strict';
const fs = require( 'fs' );
const MapParser = require( './MapParser' );
const Collection = require( '../../Collections' ).NumericIdCollection;
class MapsAPI extends Collection {
	constructor( array, resourcesPath )
	{
		super();
		this.items = array;
		this.resourcesPath = resourcesPath;
	}

	loadMap( id, callback )
	{
		if( typeof callback !== 'function' )
		{
			throw new TypeError( 'Callback must be a function' );
		}
		let index = this.find( id );
		if( index === -1 )
		{
			callback( new Error( `Map with id ${id} does not exist` ) );
			return;
		}
		let mapPath = this.resourcesPath + this.items[ index ][ "map_file" ];
		fs.readFile( mapPath, ( loadMapError, data ) =>
		{
			if( loadMapError )
			{
				callback( loadMapError );
			}
			else
			{
				try
				{
					let parsedMap = MapParser.parse( data );
					callback( void 0, parsedMap );
				}
				catch( parseMapError )
				{
					callback( parseMapError );
				}
			}
		} );
	}

	mapExists( id )
	{
		return this.find( id ) !== -1;
	}
}
module.exports = MapsAPI;
