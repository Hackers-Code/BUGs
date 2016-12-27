'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const Numbers = require( './../lib/Utils/Numbers' );
const UniqueKeyGenerator = require( './../lib/Utils/UniqueKeyGenerator' );
const UniqueNameStorage = require( './../lib/Utils/UniqueNameStorage' );
const SearchEngine = require( './../lib/Utils/SearchEngine' );
describe( 'Numbers', function()
{
	it( 'isUInt32() should return false if number is less than 0', function()
	{
		expect( Numbers.isUInt32( -1 ) ).to.equal( false );
	} );
	it( 'isUInt32() should return false if number is bigger or equal 2^32', function()
	{
		expect( Numbers.isUInt32( Math.pow( 2, 32 ) ) ).to.equal( false );
	} );
	it( 'isUInt32() should return false if parameter is not number', function()
	{
		expect( Numbers.isUInt32( 'not uint32' ) ).to.equal( false );
	} );
	it( 'isUInt32() should return true for correct uint32', function()
	{
		expect( Numbers.isUInt32( 1337 ) ).to.equal( true );
	} );
} );
describe( 'UniqueKeyGenerator', function()
{
	it( 'generateKey() should return buffer', function()
	{
		let ukg = new UniqueKeyGenerator( 4 );
		expect( ukg.generateKey() instanceof Buffer ).to.equal( true );
	} );
	it( 'keyExists() should return true for existing key', function()
	{
		let ukg = new UniqueKeyGenerator( 4 );
		let key = ukg.generateKey();
		expect( ukg.keyExists( key ) ).to.equal( true );
	} );
	it( 'keyExists() should return false for not existing key', function()
	{
		let ukg = new UniqueKeyGenerator( 4 );
		expect( ukg.keyExists( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
	} );
	it( 'freeKey() should make keyExists() return false', function()
	{
		let ukg = new UniqueKeyGenerator( 4 );
		let key = ukg.generateKey();
		ukg.freeKey( key );
		expect( ukg.keyExists( key ) ).to.equal( false );
	} );

} );
describe( 'UniqueNameStorage', function()
{
	it( 'addName() should return false if buffer is different size than specified', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		expect( uns.addName( Buffer.from( '0000000000', 'hex' ) ) ).to.equal( false );
	} );
	it( 'addName() should return false if name is not a buffer', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		expect( uns.addName( {} ) ).to.equal( false );
	} );
	it( 'addName() should return false if name is not free', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		uns.addName( Buffer.from( '00000000', 'hex' ) );
		expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
	} );
	it( 'addName() should return true for correct name', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
	} );
	it( 'isUnique() should return true if name is unique', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		expect( uns.isUnique( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
	} );
	it( 'isUnique() should return false if name is not unique', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		uns.addName( Buffer.from( '00000000', 'hex' ) );
		expect( uns.isUnique( Buffer.from( '00000000', 'hex' ) ) ).to.equal( false );
	} );
	it( 'isUnique() should return false if name is default', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		expect( uns.isUnique( uns.defaultName ) ).to.equal( false );
	} );
	it( 'isUnique() should return false for default name', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		expect( uns.isUnique( uns.defaultName ) ).to.equal( false );
	} );
	it( 'removeName() should free the name', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		uns.addName( Buffer.from( '00000000', 'hex' ) );
		uns.removeName( Buffer.from( '00000000', 'hex' ) );
		expect( uns.addName( Buffer.from( '00000000', 'hex' ) ) ).to.equal( true );
	} );
	it( 'removeName() should not free default name name', function()
	{
		let uns = new UniqueNameStorage( 4, 'Anonymous' );
		uns.removeName( uns.defaultName );
		expect( uns.addName( uns.defaultName ) ).to.equal( false );
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

