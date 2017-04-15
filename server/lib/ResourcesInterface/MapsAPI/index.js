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
		MapLoader.loadMap( id, this.items, ( err, data ) =>
		{
			if( err )
			{
				callback( err );
				return;
			}
			try
			{
				let parsedMap = MapParser.parse( data );
				callback( void 0, parsedMap );
			}
			catch( e )
			{
				callback( e );
			}
		} );
	}

	mapExists( id )
	{
		return this.find( id ) !== -1;
	}
}
module.exports = MapsAPI;
