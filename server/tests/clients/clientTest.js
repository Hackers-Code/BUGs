'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const ClientsStorage = require( '../../lib/Clients/ClientsStorage' );
const Client = require( '../../lib/Clients/Client' ).Client;
const UniqueNameStorage = require( '../../lib/Utils/UniqueNameStorage' );
describe( 'Client', () =>
{
	let client;
	let write;
	let end;
	beforeEach( () =>
	{
		write = sinon.spy();
		end = sinon.spy();
		client = new Client( {
			write : write,
			end : end
		}, Buffer.from( '00000000', 'hex' ), new UniqueNameStorage( 20, 'Anonymous' ) );
	} );
	describe( '#getCallbacks()', () =>
	{
		it( 'should return object with properties onData and onClose', () =>
		{
			let callbacks = client.getCallbacks();
			expect( callbacks ).to.have.all.keys( [
				'onData',
				'onClose'
			] );
			expect( callbacks.onData ).to.be.a( 'function' );
			expect( callbacks.onClose ).to.be.a( 'function' );
		} )
	} );
	describe( '#send()', () =>
	{
		it( 'should call spy once', () =>
		{
			let msg = Buffer.from( 'abc' );
			client.send( {
				opcode : 0x00,
				length : Buffer.from( [ msg.length ] ),
				error : msg
			} );
			expect( write.callCount ).to.equal( 1 );
		} );
	} );
	describe( '#sendID()', () =>
	{
		it( 'should call spy once', () =>
		{
			client.sendID();
			expect( write.callCount ).to.equal( 1 );
		} );
	} );
	describe( '#handleData()', () =>
	{
		it( 'should not call spy if nothing new was parsed', () =>
		{
			client.handleData();
			expect( write.callCount ).to.equal( 0 );
		} );
		it( 'should call spy if enough new data were added', () =>
		{
			client.handleData( Buffer.from( '010000000000000000000000000000000000000000', 'hex' ) );
			expect( write.callCount ).to.equal( 1 );
		} );
		it( 'should call spy twice if enough new data were added', () =>
		{
			client.handleData(
				Buffer.from( '010000000000000000000000000000000000000000010000000000000000000000000000000000000000',
					'hex' ) );
			expect( write.callCount ).to.equal( 2 );
		} );
	} );
	describe( '#respond()', () =>
	{
		it( 'should call setName function', () =>
		{
			let spy = sinon.spy( client, "setName" );
			client.respond( { callback : 'setName' },
				{ name : Buffer.from( '0000000000000000000000000000000000000000', 'hex' ) } );
			expect( spy.callCount ).to.equal( 1 );
		} );
		it( 'should call send if response is specified', () =>
		{
			let spy = sinon.spy( client, "send" );
			client.respond( {
				callback : 'setName',
				response : 0x02
			}, { name : Buffer.from( '0000000000000000000000000000000000000000', 'hex' ) } );
			expect( spy.callCount ).to.equal( 1 );
		} );
	} );
} );
