'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const Numbers = require( './../lib/Utils/Numbers' );

describe( 'UInt32', function()
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
