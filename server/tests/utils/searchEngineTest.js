'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const SearchEngine = require( './../../lib/Utils/SearchEngine' );

describe( 'SearchEngine', function()
{
	describe( '#findByUniqueId()', function()
	{
		let array = [
			{
				id : Buffer.from( '00000001', 'hex' )
			},
			{
				id : Buffer.from( '00000002', 'hex' )
			},
			{
				id : Buffer.from( '00000003', 'hex' )
			}
		];
		it( 'should return 1', function()
		{
			let id = Buffer.from( '00000002', 'hex' );
			expect( SearchEngine.findByUniqueID( id, array ) ).to.equal( 1 );
		} );
		it( 'should return -1', function()
		{
			let id = Buffer.from( '00000004', 'hex' );
			expect( SearchEngine.findByUniqueID( id, array ) ).to.equal( -1 );
		} );
		it( 'should return false', function()
		{
			let id = 0;
			expect( SearchEngine.findByUniqueID( id, array ) ).to.equal( false );
		} );
	} );

	describe( '#findByNumericId()', function()
	{
		let array = [
			{
				id : 1
			},
			{
				id : 2
			},
			{
				id : 3
			}
		];
		it( 'should return 1', function()
		{
			expect( SearchEngine.findByNumericId( 1, array ) ).to.equal( 0 );
		} );
		it( 'should return -1', function()
		{
			expect( SearchEngine.findByNumericId( 4, array ) ).to.equal( -1 );
		} );
	} );
} );

