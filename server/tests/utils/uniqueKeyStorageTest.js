'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const UniqueKeyGenerator = require( './../../lib/Utils/UniqueKeyGenerator' );

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
