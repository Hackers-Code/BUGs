'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const MapParser = require( './../../lib/MapInterface/MapParser' );

describe( 'MapParser', function()
{
	describe( '#parse()', function()
	{
		it( 'should throw exception if map does not contain full metadata', function()
		{
			expect( MapParser.parse.bind( MapParser, Buffer.from( '0000', 'hex' ) ) ).to.throw( 'Map file invalid' );
		} );
		it( 'should throw exception if map contains unknown block', function()
		{
			expect( MapParser.parse.bind( MapParser, Buffer.from( '0000000000000000000000000000000007', 'hex' ) ) ).to
			.throw( 'Map file broken' );
		} );
		it( 'should throw exception if map contains broken block', function()
		{
			expect( MapParser.parse.bind( MapParser, Buffer.from( '0000000000000000000000000000000001', 'hex' ) ) ).to
			.throw( 'Unexpected end of file' );
		} );
		it( 'should return object if map is correct', function()
		{
			expect( MapParser.parse( Buffer.from( '00000000000000000000000000000000010000000000000000', 'hex' ) ) ).to
			.be
			.an( 'object' );
		} );
	} );
} );
