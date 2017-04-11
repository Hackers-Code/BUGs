'use strict';
const MapLoader = require( './MapLoader' );
const MapParser = require( './MapParser' );
const SearchEngine = require( '../GameServer/Helpers/SearchEngine' );
const fs = require( 'fs' );
const MapInterface = {

	loadAndParseMapsList : ( dir, callback ) =>
	{
		fs.readFile( dir, ( err, data ) =>
		{
			if( err )
			{
				callback( err );
				return;
			}
			let parsedJSON = JSON.parse( data );
			if( typeof parsedJSON === 'undefined' || parsedJSON instanceof Array === false )
			{
				callback( new Error( 'JSON is not an array' ) );
				return;
			}
			callback( void 0, parsedJSON );
		} );
	},

	getParsedMap : ( id, mapsList, callback ) =>
	{
		if( typeof callback !== 'function' )
		{
			throw new Error( 'Callback must be a function' );
		}
		MapLoader.loadMap( id, mapsList, ( err, data ) =>
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
	},

	mapExists : ( id, mapsList ) =>
	{
		return SearchEngine.findByNumericId( id, mapsList ) !== -1;
	}
};
module.exports = MapInterface;
