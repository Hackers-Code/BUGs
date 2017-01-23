'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const MapInterface = require( './../../lib/MapInterface/MapInterface' );

describe( 'MapInterface', function()
{
	it( 'loadMap() should return map object for valid map id', function( done )
	{
		MapInterface.getParsedMap( 1, done );
	} );
	it( 'loadMap() should throw an exception for invalid map id', function( done )
	{
		MapInterface.getParsedMap( 1337, function( err )
		{
			if( err )
			{
				done();
			}
			else
			{
				done( true );
			}
		} );
	} );
	it( 'loadMap() should throw an exception if callback is not a function', function()
	{
		expect( MapInterface.getParsedMap.bind( MapInterface, 1, 'a' ) ).to.throw( 'Callback must be a function' );
	} )
} );
