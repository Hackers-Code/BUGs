'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const SearchEngine = require( './../lib/Utils/SearchEngine' );

describe( 'SearchEngine', function()
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
	it( 'findByUniqueID() should return 1', function()
	{
		let id = Buffer.from( '00000002', 'hex' );
		expect( SearchEngine.findByUniqueID( array, id ) ).to.equal( 1 );
	} );
	it( 'findByUniqueID() should return -1', function()
	{
		let id = Buffer.from( '00000004', 'hex' );
		expect( SearchEngine.findByUniqueID( array, id ) ).to.equal( -1 );
	} );
	it( 'findByUniqueID() should return false', function()
	{
		let id = 0;
		expect( SearchEngine.findByUniqueID( array, id ) ).to.equal( false );
	} );
} );
