'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const StreamParser = require( '../../lib/Protocol/StreamParser' );

describe( 'StreamParser', () =>
{
	let streamParser;
	beforeEach( () =>
	{
		streamParser = new StreamParser();
	} );
	describe( '#appendData()', () =>
	{
		it( 'should return false if data is no buffer', () =>
		{
			expect( streamParser.appendData( 1234 ) ).to.equal( false );
		} );
		it( 'should return true if data is buffer', () =>
		{
			expect( streamParser.appendData( Buffer.from( '260000000001', 'hex' ) ) ).to.equal( true );
		} );
	} );
	describe( '#freeBufferToOffset()', () =>
	{
		it( 'should return new length of buffer', () =>
		{
			streamParser.appendData( Buffer.from( '12345678', 'hex' ) );
			expect( streamParser.freeBufferToOffset( 1 ) ).to.equal( 3 );
		} );
	} );
	describe( '#getBuffer()', () =>
	{
		it( 'should return a buffer', () =>
		{
			expect( Buffer.isBuffer( streamParser.getBuffer() ) ).to.equal( true );
		} );
	} );
} );
