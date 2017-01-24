'use strict';
const MapLoader = require( './MapLoader' );
const MapParser = require( './MapParser' );
const SearchEngine = require( '../Utils/SearchEngine' );
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
			if( typeof parsedJSON.list === 'undefined' || parsedJSON.list instanceof Array === false )
			{
				callback( new Error( 'JSON does not contain list field' ) );
				return;
			}
			callback( void 0, parsedJSON.list );
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
				console.log( 'parsing' );
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
