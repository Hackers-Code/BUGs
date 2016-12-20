'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const UniqueNameStorage = require( './../lib/Utils/UniqueNameStorage' );

describe( 'UniqueNameStorage', function()
{
	it( 'addName() should return false if buffer is different size than specified', function()
	{
		let uns = new UniqueNameStorage( 4 );
		expect( uns.addName( Buffer.from( '0000000000', 'hex' ) ) ).to.equal( false );
	} );
	it( 'addName() should return false if name is not a buffer', function()
	{
		let uns = new UniqueNameStorage( 4 );
		expect( uns.addName( {} ) ).to.equal( false );
	} );
	it( 'addName() should return false if name is not free', function()
	{
		let uns = new UniqueNameStorage( 4 );
		uns.addName( Buffer.from( '00000000', 'hex' ) );
		expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
	} );
	it( 'addName() should return true for correct name', function()
	{
		let uns = new UniqueNameStorage( 4 );
		expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
	} );
	it( 'isUnique() should return true if name is unique', function()
	{
		let uns = new UniqueNameStorage( 4 );
		expect( uns.isUnique( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
	} );
	it( 'isUnique() should return false if name is not unique', function()
	{
		let uns = new UniqueNameStorage( 4 );
		uns.addName( Buffer.from( '00000000', 'hex' ) );
		expect( uns.isUnique( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
	} );
	it( 'removeName() should free the name', function()
	{
		let uns = new UniqueNameStorage( 4 );
		uns.addName( Buffer.from( '00000000', 'hex' ) );
		uns.removeName( Buffer.from( '00000000', 'hex' ) );
		expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
	} );
} );
