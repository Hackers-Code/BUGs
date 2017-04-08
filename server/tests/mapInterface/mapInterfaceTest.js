'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const MapInterface = require( '../../lib/MapInterface/MapInterface' );
const sinon = require( 'sinon' );
const fs = require( 'fs' );

describe( 'MapInterface', () =>
{
	describe( '#loadAndParseMapsList()', () =>
	{
		let stub;
		beforeEach( () =>
		{
			stub = sinon.stub( fs, "readFile", ( dir, callback ) =>
			{
				if( dir === process.cwd() + '/resources/maps/list.json' )
				{
					callback( void 0, "[]" );
					return;
				}
				callback( new Error() );
			} );
		} );
		afterEach( () =>
		{
			stub.restore();
		} );
		it( 'should not pass error for valid maps list file', ( done ) =>
		{
			MapInterface.loadAndParseMapsList( process.cwd() + '/resources/maps/list.json', ( err, data ) =>
			{
				if( err )
				{
					done( err );
					return;
				}
				if( data instanceof Array )
				{
					done();
					return;
				}
				done( new Error( 'Map list is not an array' ) );
			} );
		} );
		it( 'should pass error for invalid maps list file', ( done ) =>
		{
			MapInterface.loadAndParseMapsList( process.cwd() + '/1234', ( err ) =>
			{
				if( err )
				{
					done();
					return;
				}
				done( new Error() );
			} );
		} );
	} );

	describe( '#mapExist()', () =>
	{
		it( 'should return true if map is in map list', function()
		{
			expect( MapInterface.mapExists( 1, [ { id : 1 } ] ) ).to.equal( true );
		} );
		it( 'should return true if map is not in map list', function()
		{
			expect( MapInterface.mapExists( 2, [ { id : 1 } ] ) ).to.equal( false );
		} );
	} );

	describe( '#getParsedMap()', () =>
	{
		let stub;
		beforeEach( () =>
		{
			stub = sinon.stub( fs, "readFile", ( dir, callback ) =>
			{
				if( dir === process.cwd() + '/resources/maps/test.map' )
				{
					callback( void 0, Buffer.from( (function()
					{
						return '00000000000000000000177000000e1002000000000000051400001770000008fc01000000000000049c01000000c80000049c01000001900000049c01000002580000049c01000003200000049c01000003e80000' + '049c01000004b00000049c01000005780000049c01000006400000049c01000007080000049c01000007d00000049c01000008980000049c01000009600000049c0100000a280000049c0100000' + 'af00000049c0100000bb80000049c0100000c800000049c0100000d480000049c0100000e100000049c0100000ed80000049c0100000fa00000049c01000010680000049c01000011300000049c' + '01000011f80000049c01000012c00000049c01000013880000049c01000014500000049c01000015180000049c01000015e00000049c01000016a80000049c'
					})(), 'hex' ) );
					return;
				}
				callback( new Error() );
			} );
		} );
		afterEach( () =>
		{
			stub.restore();
		} );
		let mapsList = [
			{
				id : 1,
				map_file : "/maps/test.map"
			}
		];
		it( 'should return map object for valid map id', ( done ) =>
		{
			MapInterface.getParsedMap( 1, mapsList, done );
		} );
		it( 'should throw an exception for invalid map id', ( done ) =>
		{
			MapInterface.getParsedMap( 1337, mapsList, ( err ) =>
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
		it( 'should throw an exception if callback is not a function', () =>
		{
			expect( MapInterface.getParsedMap.bind( MapInterface, 1, 'a' ) ).to.throw( 'Callback must be a function' );
		} )
	} );

} );
