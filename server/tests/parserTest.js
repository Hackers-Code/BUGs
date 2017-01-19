'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const StreamParser = require( '../lib/Protocol/StreamParser' );
const PacketDecoder = require( '../lib/Protocol/PacketDecoder' );
const PacketEncoder = require( '../lib/Protocol/PacketEncoder' );
const ClientInstructions = require( '../lib/Protocol/ClientInstructions' );
const ServerInstructions = require( '../lib/Protocol/ServerInstructions' );
describe( 'StreamParser', () =>
{
	let streamParser;
	beforeEach( () =>
	{
		streamParser = new StreamParser( ClientInstructions );
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
describe( 'PacketDecoder', () =>
{
	let packetDecoder;
	beforeEach( () =>
	{
		packetDecoder = new PacketDecoder( ClientInstructions );
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
			.to.deep.equal( {
				offset : 7,
				object : {
					room : Buffer.from( '00000000', 'hex' ),
					length : Buffer.from( '01', 'hex' ),
					password : Buffer.from( '11', 'hex' )
				}
			} );
		} );
	} );
} );
describe( 'PacketEncoder', () =>
{
	let packetEncoder;
	beforeEach( () =>
	{
		packetEncoder = new PacketEncoder( ServerInstructions );
	} );
	describe( '#encode()', () =>
	{
		it( 'should throw an error for object without opcode (type: number) property', () =>
		{
			expect( packetEncoder.encode.bind( packetEncoder, { opcode : '123' } ) ).to.throw( 0xe2 );
		} );
		it( 'should throw an error if opcode is unknown', () =>
		{
			expect( packetEncoder.encode.bind( packetEncoder, { opcode : 1 } ) ).to.throw( 0xe2 );
		} );
		it( 'should throw an error if not all parameters are given', () =>
		{
			expect( packetEncoder.encode.bind( packetEncoder, {
				opcode : 0,
				length : Buffer.from( '01', 'hex' )
			} ) ).to.throw( 0xe2 );
		} );
		it( 'should throw an error if not all parameters are buffers', () =>
		{
			expect( packetEncoder.encode.bind( packetEncoder, {
				opcode : 0,
				length : 1,
				error : Buffer.from( '12345678901234567890' )
			} ) ).to.throw( 0xe2 );
		} );
		it( 'should throw an error if not all parameters are correct length', () =>
		{
			expect( packetEncoder.encode.bind( packetEncoder, {
				opcode : 0,
				length : Buffer.from( '01', 'hex' ),
				error : Buffer.from( '12345678901234567890' )
			} ) ).to.throw( 0xe2 );
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
			expect( packetEncoder.encode.bind( packetEncoder, {
				opcode : 0x11,
				count : Buffer.from( '00000002', 'hex' ),
				games : [
					{
						id : Buffer.from( '12341234', 'hex' ),
						name : Buffer.from( '1234567890123456789012345678901234567890', 'hex' )
					}
				]
			} ) ).to.throw( 0xe2 );
		} );
		it( 'should throw an error for correct object with array if count is not specified', () =>
		{
			expect( packetEncoder.encode.bind( packetEncoder, {
				opcode : 0x11,
				games : [
					{
						id : Buffer.from( '12341234', 'hex' ),
						name : Buffer.from( '1234567890123456789012345678901234567890', 'hex' )
					}
				]
			} ) ).to.throw( 0xe2 );
		} );
	} );
} );
