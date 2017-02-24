'use strict';
const RoomsStorage = require( '../../lib/Rooms/RoomsStorage' );
const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;

describe( 'RoomsStorage', () =>
{
	let roomsStorage;
	beforeEach( () =>
	{
		roomsStorage = new RoomsStorage();
	} );
	describe( '#addRoom()', () =>
	{
		it( 'should return false for bad parameters', () =>
		{
			expect( roomsStorage.addRoom( null, null ) ).to.equal( false );
		} );
	} );
	describe( '#getRooms()', () =>
	{
		it( 'should return empty array if no rooms were added', () =>
		{
			expect( roomsStorage.getRooms() ).to.be.an( 'array' ).with.length( 0 );
		} );
		it( 'should return array with length 1 after adding 1 room', () =>
		{
			roomsStorage.addRoom( {
				name : Buffer.from( 'abcdefghijklmnoprtuw' ),
				password : Buffer.from( 'ABCD' )
			}, {} );
			expect( roomsStorage.getRooms() ).to.be.an( 'array' ).with.length( 1 );
		} );
	} );
	describe( '#listAvailableGames()', () =>
	{
		it( 'should return object with properties: games ( array ), count ( buffer )', () =>
		{
			let list = roomsStorage.listAvailableGames();
			expect( list ).to.have.property( 'games' ).that.is.an( 'array' ).with.length( 0 );
			expect( list ).to.have.property( 'count' ).that.is.instanceOf( Buffer );
		} );
	} );
} );
