'use strict';
const chai = require( 'chai' );
const expect = chai.expect;
const ClientsStorage = require( '../../lib/Clients/ClientsStorage' );
describe( 'Clients storage', () =>
{
	let clientsStorage;
	beforeEach( () =>
	{
		clientsStorage = new ClientsStorage( 2 );
	} );
	describe( '#getClients()', () =>
	{
		it( 'should return empty array', () =>
		{
			expect( clientsStorage.getClients() ).to.be.an( 'array' ).with.length( '0' );
		} )
	} );
	describe( '#addClient()', () =>
	{
		it( 'should return false if there are no empty slots', () =>
		{
			clientsStorage.addClient( {
				write : () => {},
				end : () => {}
			} );
			clientsStorage.addClient( {} );
			expect( clientsStorage.addClient( {} ) ).to.equal( false );
		} )
	} );
} );
