'use strict';
const chai = require( 'chai' );
const MapLoader = require( './../../lib/MapInterface/MapLoader' );
const sinon = require( 'sinon' );
const fs = require( 'fs' );

describe( 'MapLoader', function()
{
	describe( '#loadMap()', () =>
	{
		let stub;
		beforeEach( () =>
		{
			stub = sinon.stub( fs, "readFile", ( dir, callback ) =>
			{
				if( dir === process.cwd() + '/resources/maps/test.map' )
				{
					callback( void 0, Buffer.from( '00000000000000000000000000000000000000000000000000', 'hex' ) );
					return;
				}
				callback( new Error() );
			} );
		} );
		afterEach( () =>
		{
			stub.restore();
		} );
		it( 'should not load not existing map', ( done ) =>
		{
			MapLoader.loadMap( 1000, [
				{
					id : 1,
					map_file : "/maps/test.map"
				}
			], ( err ) =>
			{
				if( err )
				{
					done();
				}
				else
				{
					done( new Error( 'Should pass an error' ) );
				}
			} );
		} );
		it( 'should not load existing map if file not exist', ( done ) =>
		{
			MapLoader.loadMap( 1, [
				{
					id : 1,
					map_file : "/maps/test123.map"
				}
			], ( err, data ) =>
			{
				if( err )
				{
					done();
				}
				else
				{
					done( new Error( 'Should pass an error' ) );
				}
			} );
		} );
		it( 'should load existing map', ( done ) =>
		{
			MapLoader.loadMap( 1, [
				{
					id : 1,
					map_file : "/maps/test.map"
				}
			], ( err, data ) =>
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
} );
