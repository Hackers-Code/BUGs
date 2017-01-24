'use strict';
const fs = require( 'fs' );
const SearchEngine = require( '../Utils/SearchEngine' );
const MapLoader = {
	loadMap : function( mapID, mapList, callback )
	{
		let index = SearchEngine.findByNumericId( mapID, mapList );
		if( index === -1 )
		{
			callback( new Error( 'Trying to load not existing map' ) );
		}
		let mapDir = process.cwd() + '/resources' + mapList[ index ][ "map_file" ];
		fs.readFile( mapDir, ( err, data ) =>
		{
			if( err )
			{
				callback( err );
				return;
			}
			callback( void 0, data );
		} );
	}
};

module.exports = MapLoader;
