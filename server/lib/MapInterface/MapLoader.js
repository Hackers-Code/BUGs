'use strict';
const fs = require( 'fs' );
const MapLoader = {
	loadMap : function( mapID, callback )
	{
		let mapDir = __dirname + '/maps/' + mapID + '.map';
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
