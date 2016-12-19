'use strict';
const fs = require( 'fs' );
const Numbers = require( './../Utils/Numbers' );
const MapLoader = {
	loadMap : function( mapID, callback )
	{
		if( !Numbers.isUInt32( mapID ) )
		{
			throw new Error( 'Map ID must be valid UInt32' );
		}
		let mapDir = `${__dirname}/../../maps/${mapID}.map`;
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
