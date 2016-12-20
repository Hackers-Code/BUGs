'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const UniqueKeyGenerator = require( './../lib/Utils/UniqueKeyGenerator' );

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
