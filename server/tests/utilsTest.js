'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const UniqueKeyGenerator = require( './../lib/Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( './../lib/Utils/UniqueNameStorage' );
const SearchEngine = require( './../lib/Utils/SearchEngine' );
describe( 'UniqueKeyGenerator', function()
{
	describe( '#generateKey()', function()
	{
		it( 'should return buffer', function()
		{
			let ukg = new UniqueKeyGenerator( 4 );
			expect( ukg.generateKey() instanceof Buffer ).to.equal( true );
		} );
	} );
	describe( '#keyExists()', function()
	{
		it( 'should return true for existing key', function()
		{
			let ukg = new UniqueKeyGenerator( 4 );
			let key = ukg.generateKey();
			expect( ukg.keyExists( key ) ).to.equal( true );
		} );
		it( 'should return false for not existing key', function()
		{
			let ukg = new UniqueKeyGenerator( 4 );
			expect( ukg.keyExists( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
		} );
	} );
	describe( '#freeKey()', function()
	{
		it( 'should make keyExists() return false', function()
		{
			let ukg = new UniqueKeyGenerator( 4 );
			let key = ukg.generateKey();
			ukg.freeKey( key );
			expect( ukg.keyExists( key ) ).to.equal( false );
		} );
	} );

} );
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
	describe( '#findByUniqueId()', function()
	{
		it( 'should return 1', function()
		{
			let id = Buffer.from( '00000002', 'hex' );
			expect( SearchEngine.findByUniqueID( array, id ) ).to.equal( 1 );
		} );
		it( 'should return -1', function()
		{
			let id = Buffer.from( '00000004', 'hex' );
			expect( SearchEngine.findByUniqueID( array, id ) ).to.equal( -1 );
		} );
		it( 'should return false', function()
		{
			let id = 0;
			expect( SearchEngine.findByUniqueID( array, id ) ).to.equal( false );
		} );
	} );
} );

