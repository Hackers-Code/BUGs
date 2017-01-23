'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const MapParser = require( './../../lib/MapInterface/MapParser' );

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
