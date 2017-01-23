'use strict';
const chai = require( 'chai' );
const MapLoader = require( './../../lib/MapInterface/MapLoader' );

describe( 'MapLoader', function()
{
	it( 'loadMap() should not load not existing map', function( done )
	{
		MapLoader.loadMap( 1000, function( err )
		{
			if( err )
			{
				done();
			}
			else
			{
				done( new Error() );
			}
		} );
	} );
	it( 'loadMap() should load existing map', function( done )
	{
		MapLoader.loadMap( 1, function( err, data )
		{
			if( err )
			{
				done( err );
			}
			else if( !data instanceof Buffer )
			{
				done( new Error( 'Map must be a buffer' ) );
			}
			else
			{
				done();
			}
		} );
	} );
} );
