'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const PacketDecoder = require( '../../lib/Protocol/PacketDecoder' );
describe( 'PacketDecoder', () =>
{
	let packetDecoder;
	beforeEach( () =>
	{
		packetDecoder = new PacketDecoder();
	} );
	describe( '#decode()', () =>
	{
		it( 'should return false if parameter is no buffer', () =>
		{
			expect( packetDecoder.decode( 1 ) ).to.equal( false );
		} );
		it( 'should return false if parameter is 0 length buffer', () =>
		{
			expect( packetDecoder.decode( Buffer.alloc( 0 ) ) ).to.equal( false );
		} );
		it( 'should return false if buffer is too short', () =>
		{
			expect( packetDecoder.decode( Buffer.from( '260000000001', 'hex' ) ) ).to.equal( false );
		} );
		it( 'should throw an error 0xe0 if using unknown opcode', () =>
		{
			expect( packetDecoder.decode.bind( packetDecoder, Buffer.from( '00', 'hex' ) ) ).to.throw( 0xe0 );
		} );
		it( 'should return an object if valid buffer was given', () =>
		{
			expect( packetDecoder.decode( Buffer.from( '26000000000111', 'hex' ) ) )
			.to.have.all.keys( [
				'instruction',
				'object',
				'offset'
			] );
		} );
	} );
} );
