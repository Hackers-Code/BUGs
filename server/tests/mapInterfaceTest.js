'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const MapInterface = require( './../lib/MapInterface/MapInterface' );
const MapLoader = require( './../lib/MapInterface/MapLoader' );
const MapParser = require( './../lib/MapInterface/MapParser' );
const MapDownloader = require( './../lib/MapInterface/MapDownloader' );

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
describe( 'MapParser', function()
{
	it( 'parse() should throw exception if map does not contain full metadata', function()
	{
		expect( MapParser.parse.bind( MapParser, Buffer.from( '0000', 'hex' ) ) ).to.throw( 'Map file invalid' );
	} );
	it( 'parse() should throw exception if map contains unknown block', function()
	{
		expect( MapParser.parse.bind( MapParser, Buffer.from( '000000000000000007', 'hex' ) ) ).to
		.throw( 'Map file broken' );
	} );
	it( 'parse() should throw exception if map contains broken block', function()
	{
		expect( MapParser.parse.bind( MapParser, Buffer.from( '000000000000000001', 'hex' ) ) ).to
		.throw( 'Unexpected end of file' );
	} );
	it( 'parse() should return object if map is correct', function()
	{
		expect( MapParser.parse( Buffer.from( '0000000000000000010000000000000000', 'hex' ) ) ).to.be.an( 'object' );
	} );
} );

describe( 'MapDownloader', () =>
{
	it( 'connect() should return boolean', () =>
	{

	} );
} );
