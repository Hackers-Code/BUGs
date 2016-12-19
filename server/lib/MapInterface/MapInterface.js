'use strict';
const MapLoader = require( './MapLoader' );
const MapParser = require( './MapParser' );
const MapInterface = {

	getParsedMap : function( id, callback )
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
	}
};
module.exports = MapInterface;
