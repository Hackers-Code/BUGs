'use strict';
const MapLoader = require( './MapLoader' );
const MapParser = require( './MapParser' );
const SearchEngine = require( '../utils/SearchEngine' );
const fs = require( 'fs' );
const MapInterface = {

	mapsList : [],

	getMapsList : ( dir, callback ) =>
	{
		fs.readFile( dir, ( err, data ) =>
		{
			if( err )
			{
				callback( err );
			}
			this.mapsList = JSON.parse( data );
		} );
	},

	getParsedMap : ( id, callback ) =>
	{
		if( typeof callback !== 'function' )
		{
			throw new Error( 'Callback must be a function' );
		}
		MapLoader.loadMap( id, ( err, data ) =>
		{
			if( err )
			{
				callback( err );
				return;
			}
			callback( void 0, MapParser.parse( data ) );
		} );
	},

	mapExists : ( id ) =>
	{
		return SearchEngine.findByNumericId( id, mapsList ) !== -1;
	}
};
module.exports = MapInterface;
