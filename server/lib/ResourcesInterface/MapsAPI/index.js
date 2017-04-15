'use strict';
const fs = require( 'fs' );
const MapLoader = require( './MapLoader' );
const MapParser = require( './MapParser' );
const Collection = require( '../../Collections' ).NumericIdCollection;
class MapsAPI extends Collection {
	constructor( array )
	{
		super();
		this.items = array;
	}

	loadMap( id, callback )
	{
		if( typeof callback !== 'function' )
		{
			throw new TypeError( 'Callback must be a function' );
		}
		if( !this.mapExists( id ) )
		{
			callback( new Error( `Map with id ${id} does not exist` ) );
			return;
		}
		MapLoader.loadMap( id, ( loadMapError, data ) =>
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
