'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const UniqueNameStorage = require( './../../lib/Utils/UniqueNameStorage' );

describe( 'UniqueNameStorage', function()
{
	describe( '#addName()', function()
	{
		it( 'should return false if buffer is different size than specified', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			expect( uns.addName( Buffer.from( '0000000000', 'hex' ) ) ).to.equal( false );
		} );
		it( 'should return false if name is not a buffer', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			expect( uns.addName( {} ) ).to.equal( false );
		} );
		it( 'should return false if name is not free', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			uns.addName( Buffer.from( '00000000', 'hex' ) );
			expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
		} );
		it( 'should return true for correct name', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
		} );
	} );
	describe( '#isUnique()', function()
	{
		it( 'should return true if name is unique', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			expect( uns.isUnique( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
		} );
		it( 'should return false if name is not unique', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			uns.addName( Buffer.from( '00000000', 'hex' ) );
			expect( uns.isUnique( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
		} );
		it( 'should return false if name is default', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			expect( uns.isUnique( uns.defaultName ) ).to.equal( false );
		} );
		it( 'should return false for default name', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			expect( uns.isUnique( uns.defaultName ) ).to.equal( false );
		} );
	} );
	describe( '#removeName()', function()
	{
		it( 'should free the name', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			uns.addName( Buffer.from( '00000000', 'hex' ) );
			uns.removeName( Buffer.from( '00000000', 'hex' ) );
			expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
		} );
		it( 'should not free default name name', function()
		{
			let uns = new UniqueNameStorage( 4, 'Anonymous' );
			uns.removeName( uns.defaultName );
			expect( uns.addName( uns.defaultName ) ).to.equal( false );
		} );
	} );
} );
