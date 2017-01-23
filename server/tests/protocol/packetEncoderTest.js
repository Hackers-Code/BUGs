'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const PacketEncoder = require( '../../lib/Protocol/PacketEncoder' );

describe( 'PacketEncoder', () =>
{
	let packetEncoder;
	beforeEach( () =>
	{
		packetEncoder = new PacketEncoder();
	} );
	describe( '#encode()', () =>
	{
		it( 'should throw an error for object without opcode (type: number) property', () =>
		{
			expect( packetEncoder.encode( { opcode : '123' } ) ).to.equal( false );
		} );
		it( 'should throw an error if opcode is unknown', () =>
		{
			expect( packetEncoder.encode( { opcode : 1 } ) ).to.equal( false );
		} );
		it( 'should throw an error if not all parameters are given', () =>
		{
			expect( packetEncoder.encode( {
				opcode : 0,
				length : Buffer.from( '01', 'hex' )
			} ) ).to.equal( false );
		} );
		it( 'should throw an error if not all parameters are buffers', () =>
		{
			expect( packetEncoder.encode( {
				opcode : 0,
				length : 1,
				error : Buffer.from( '12345678901234567890' )
			} ) ).to.equal( false );
		} );
		it( 'should throw an error if not all parameters are correct length', () =>
		{
			expect( packetEncoder.encode( {
				opcode : 0,
				length : Buffer.from( '01', 'hex' ),
				error : Buffer.from( '12345678901234567890' )
			} ) ).to.equal( false );
		} );
		it( 'should return buffer for correct object', () =>
		{
			expect( packetEncoder.encode( {
				opcode : 0,
				length : Buffer.from( '01', 'hex' ),
				error : Buffer.from( '01', 'hex' )
			} ) ).to.deep.equal( Buffer.from( '000101', 'hex' ) );
		} );
		it( 'should return buffer for correct object with array', () =>
		{
			expect( packetEncoder.encode( {
				opcode : 0x11,
				count : Buffer.from( '00000001', 'hex' ),
				games : [
					{
						id : Buffer.from( '12341234', 'hex' ),
						name : Buffer.from( '1234567890123456789012345678901234567890', 'hex' )
					}
				]
			} ) ).to.deep.equal( Buffer.from( '1100000001123412341234567890123456789012345678901234567890', 'hex' ) );
		} );
		it( 'should throw an error for object with array if count is not equal array length', () =>
		{
			expect( packetEncoder.encode( {
				opcode : 0x11,
				count : Buffer.from( '00000002', 'hex' ),
				games : [
					{
						id : Buffer.from( '12341234', 'hex' ),
						name : Buffer.from( '1234567890123456789012345678901234567890', 'hex' )
					}
				]
			} ) ).to.equal( false );
		} );
		it( 'should throw an error for correct object with array if count is not specified', () =>
		{
			expect( packetEncoder.encode( {
				opcode : 0x11,
				games : [
					{
						id : Buffer.from( '12341234', 'hex' ),
						name : Buffer.from( '1234567890123456789012345678901234567890', 'hex' )
					}
				]
			} ) ).to.equal( false );
		} );
	} );
} );
