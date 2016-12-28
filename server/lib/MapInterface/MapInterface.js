'use strict';
const MapLoader = require( './MapLoader' );
const MapParser = require( './MapParser' );
const fs = require( 'fs' );
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
	},

	mapExists : function( id )
	{
		return fs.existsSync( __dirname + '/maps/' + id + '.map' );
	}
};
module.exports = MapInterface;
